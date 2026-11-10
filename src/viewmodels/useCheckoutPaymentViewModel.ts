import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useCartContext } from '@/contexts/cart-context';
import { useWarehouseContext } from '@/contexts/warehouse-context';
import { formatBs } from '@/lib/format';
import {
  getPaymentDetails,
  getPaymentOptions,
  type PaymentDetail,
  paymentDetailsToText,
} from '@/lib/payment';
import type { Address } from '@/models/address.model';
import type { BankAccount } from '@/models/bank-account.model';
import type { DeliveryType, PaymentMethodType } from '@/models/order.model';
import type { SavedPaymentMethod } from '@/models/payment-method.model';
import { addressService } from '@/services/address.service';
import { bankAccountService } from '@/services/bank-account.service';
import { exchangeRateService } from '@/services/exchange-rate.service';
import { orderService } from '@/services/order.service';
import { paymentMethodService } from '@/services/payment-method.service';
import { paymentProofService } from '@/services/payment-proof.service';

/** Cuánto se muestra el check de "copiado". */
const COPIED_FEEDBACK_MS = 1500;
/** Largo de la referencia (`orders.payment_reference` es VARCHAR(10)). */
const REFERENCE_MIN = 4;
const REFERENCE_MAX = 10;

type Params = {
  deliveryType: DeliveryType;
  addressId: string | null;
};

/**
 * Paso 2 del checkout: método de pago de la tienda, datos para pagar (con copiar), desde
 * dónde pagó el cliente y la referencia; al final crea el pedido.
 */
export function useCheckoutPaymentViewModel({ deliveryType, addressId }: Params) {
  const cart = useCartContext();
  const { warehouses } = useWarehouseContext();
  const warehouse = warehouses.find((w) => w.id === cart.warehouseId) ?? null;
  const warehouseId = warehouse?.id ?? null;

  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [address, setAddress] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cuentas de la tienda, tasa del día y la dirección elegida en el paso 1.
  useEffect(() => {
    if (!warehouseId) return;
    let isActive = true;
    Promise.all([
      bankAccountService.getByWarehouse(warehouseId),
      exchangeRateService.getCurrent(),
      addressId ? addressService.getById(addressId) : Promise.resolve(null),
    ])
      .then(([accountsData, rate, addressData]) => {
        if (!isActive) return;
        setAccounts(accountsData);
        setExchangeRate(rate);
        setAddress(addressData);
        setError(null);
      })
      .catch(
        (err) =>
          isActive &&
          setError(err instanceof Error ? err.message : 'Error al cargar los métodos de pago'),
      )
      .finally(() => isActive && setIsLoading(false));
    return () => {
      isActive = false;
    };
  }, [addressId, warehouseId]);

  const options = useMemo(() => getPaymentOptions(accounts), [accounts]);
  // Referencia del pago (se limpia al cambiar de método).
  const [reference, setReference] = useState('');
  const [selectedType, setSelectedType] = useState<PaymentMethodType | null>(null);
  const selectedOption = options.find((o) => o.type === selectedType) ?? options[0] ?? null;
  const isBolivares = selectedOption?.currency === 'BS';

  const isDelivery = deliveryType === 'delivery';
  const deliveryFee = isDelivery ? (warehouse?.deliveryFee ?? 0) : 0;
  const totalUsd = cart.subtotal + deliveryFee;

  const details = useMemo(
    () =>
      selectedOption && exchangeRate
        ? getPaymentDetails(selectedOption, totalUsd, exchangeRate)
        : [],
    [exchangeRate, selectedOption, totalUsd],
  );

  /** Elige el método desde el desplegable (que trabaja con las etiquetas). */
  const selectMethodByLabel = useCallback(
    (label: string) => {
      const option = options.find((o) => o.label === label);
      if (!option) return;
      Haptics.selectionAsync();
      setSelectedType(option.type);
      setReference('');
    },
    [options],
  );

  // Copiar: un dato o todos; el check se muestra un momento.
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
    },
    [],
  );
  const copyText = useCallback(async (text: string, key: string) => {
    await Clipboard.setStringAsync(text);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopiedKey(key);
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopiedKey(null), COPIED_FEEDBACK_MS);
  }, []);
  const copyDetail = useCallback(
    (detail: PaymentDetail) => copyText(detail.value, detail.key),
    [copyText],
  );
  const copyAll = useCallback(() => {
    if (!selectedOption) return;
    copyText(paymentDetailsToText(selectedOption, details), 'all');
  }, [copyText, details, selectedOption]);

  // Desde dónde pagó (métodos en bolívares): sus métodos guardados; se recargan al volver.
  const [payerMethods, setPayerMethods] = useState<SavedPaymentMethod[]>([]);
  const [selectedPayerId, setSelectedPayerId] = useState<string | null>(null);
  const [isPayerSheetOpen, setIsPayerSheetOpen] = useState(false);
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      paymentMethodService
        .getMine()
        .then((data) => {
          if (!isActive) return;
          setPayerMethods(data);
          setSelectedPayerId((current) =>
            current && data.some((m) => m.id === current)
              ? current
              : ((data.find((m) => m.isDefault) ?? data[0])?.id ?? null),
          );
        })
        .catch(() => {});
      return () => {
        isActive = false;
      };
    }, []),
  );
  const selectedPayer = payerMethods.find((m) => m.id === selectedPayerId) ?? null;
  const openPayerSheet = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsPayerSheetOpen(true);
  }, []);
  const closePayerSheet = useCallback(() => setIsPayerSheetOpen(false), []);
  const selectPayer = useCallback((method: SavedPaymentMethod) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSelectedPayerId(method.id);
    setIsPayerSheetOpen(false);
  }, []);
  const addPayer = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsPayerSheetOpen(false);
    router.push('/account/payment-methods/new');
  }, []);

  // Referencia del pago: solo dígitos en bolívares; en dólares puede tener letras (Zelle).
  const changeReference = useCallback(
    (value: string) => {
      const clean = isBolivares ? value.replace(/\D/g, '') : value.replace(/\s/g, '');
      setReference(clean.slice(0, REFERENCE_MAX));
    },
    [isBolivares],
  );

  // Comprobante de pago (opcional): se elige aquí y se sube al realizar el pedido.
  const [proof, setProof] = useState<{ uri: string; mimeType: string } | null>(null);
  const pickProof = useCallback(async () => {
    Haptics.selectionAsync();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    setProof({ uri: asset.uri, mimeType: asset.mimeType ?? 'image/jpeg' });
  }, []);
  const removeProof = useCallback(() => {
    Haptics.selectionAsync();
    setProof(null);
  }, []);

  const [isPlacing, setIsPlacing] = useState(false);
  // Etapa del envío, para el texto del botón: subiendo el comprobante o creando el pedido.
  const [placingStep, setPlacingStep] = useState<'proof' | 'order'>('order');
  const [placeError, setPlaceError] = useState<string | null>(null);
  const canPlaceOrder =
    !!warehouse &&
    !!selectedOption &&
    !!exchangeRate &&
    cart.items.length > 0 &&
    reference.length >= REFERENCE_MIN &&
    (!isBolivares || !!selectedPayer) &&
    (!isDelivery || !!address) &&
    !isPlacing;

  /** Crea el pedido, vacía el carrito y abre el pedido recién hecho en Pedidos. */
  const placeOrder = useCallback(async () => {
    if (!canPlaceOrder || !warehouse || !selectedOption || !exchangeRate) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    try {
      setIsPlacing(true);
      // Primero el comprobante (si hay); si falla, no se crea el pedido.
      let paymentProofUrl: string | null = null;
      if (proof) {
        setPlacingStep('proof');
        paymentProofUrl = await paymentProofService.upload(proof.uri, proof.mimeType);
      }
      setPlacingStep('order');
      setPlaceError(null);
      const order = await orderService.create({
        warehouseId: warehouse.id,
        deliveryType,
        addressId: isDelivery ? (address?.id ?? null) : null,
        paymentMethodType: selectedOption.type,
        bankAccountId: selectedOption.account.id,
        paymentBank: isBolivares ? (selectedPayer?.bank ?? null) : null,
        paymentReference: reference,
        exchangeRate,
        items: cart.items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        paymentProofUrl,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      cart.clear();
      // Paso 3 (resultado). `replace` para que "atrás" no vuelva al pago ya hecho.
      router.replace({ pathname: '/checkout/success', params: { orderId: order.id } });
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setPlaceError(err instanceof Error ? err.message : 'No pudimos crear tu pedido');
    } finally {
      setIsPlacing(false);
    }
  }, [
    address,
    canPlaceOrder,
    proof,
    cart,
    deliveryType,
    exchangeRate,
    isBolivares,
    isDelivery,
    reference,
    selectedOption,
    selectedPayer,
    warehouse,
  ]);

  const goBack = useCallback(() => router.back(), []);

  return {
    currentStep: 1,
    warehouse,
    isLoading,
    error,

    options,
    methodLabels: options.map((o) => o.label),
    selectedOption,
    selectMethodByLabel,
    isBolivares,

    details,
    copiedKey,
    copyDetail,
    copyAll,
    rateNote: exchangeRate ? `Tasa del día: ${formatBs(exchangeRate)} por dólar.` : undefined,

    payerMethods,
    selectedPayer,
    isPayerSheetOpen,
    openPayerSheet,
    closePayerSheet,
    selectPayer,
    addPayer,

    reference,
    changeReference,
    referenceMaxLength: REFERENCE_MAX,

    totalUsd,
    totalBs: exchangeRate ? totalUsd * exchangeRate : null,
    canPlaceOrder,
    isPlacing,
    placingLabel: placingStep === 'proof' ? 'Subiendo comprobante…' : 'Enviando pedido…',
    placeError,
    proof,
    pickProof,
    removeProof,
    placeOrder,
    goBack,
  };
}
