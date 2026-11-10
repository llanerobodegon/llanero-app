import { SymbolView } from 'expo-symbols';
import {
  Button,
  Description,
  Label,
  PressableFeedback,
  Skeleton,
  Spinner,
  TextField,
  useThemeColor,
} from 'heroui-native';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StepsIndicator } from '@/components/steps-indicator';
import { PaymentDetailsCard } from '@/components/checkout/payment-details-card';
import { EmptyState } from '@/components/empty-state';
import { FormInput } from '@/components/form/form-input';
import { KeypadField } from '@/components/form/keypad-field';
import { SelectField } from '@/components/form/select-field';
import { OptionsSheet } from '@/components/options-sheet';
import { ScreenHeader } from '@/components/screen-header';
import { useActionForeground } from '@/hooks/use-action-foreground';
import { formatBs, formatUSD } from '@/lib/format';
import type { DeliveryType } from '@/models/order.model';
import type { SavedPaymentMethod } from '@/models/payment-method.model';
import { useCheckoutPaymentViewModel } from '@/viewmodels/useCheckoutPaymentViewModel';
import { CHECKOUT_STEPS } from '@/viewmodels/useCheckoutViewModel';

/** "Banesco · 0414-1234567" */
const payerSummary = (method: SavedPaymentMethod) =>
  `${method.bank} · ${method.phoneCode}-${method.phoneNumber}`;

function SectionTitle({ children, action }: { children: string; action?: React.ReactNode }) {
  return (
    <View className="flex-row items-center justify-between pr-1">
      <Text className="pl-1 text-sm font-semibold text-muted" accessibilityRole="header">
        {children}
      </Text>
      {action}
    </View>
  );
}

/** Checkout, paso 2 (detalles de pago): método, datos para pagar, origen, referencia y pedir. */
export function CheckoutPaymentView({
  deliveryType,
  addressId,
}: {
  deliveryType: DeliveryType;
  addressId: string | null;
}) {
  const vm = useCheckoutPaymentViewModel({ deliveryType, addressId });
  const insets = useSafeAreaInsets();
  const [foreground, background] = useThemeColor(['foreground', 'background']);
  const actionForeground = useActionForeground();
  const header = (
    <>
      <ScreenHeader title="Finalizar pedido" onBack={vm.goBack} />
      <View className="pb-3 pt-1">
        <StepsIndicator steps={CHECKOUT_STEPS} current={vm.currentStep} />
      </View>
    </>
  );

  if (vm.isLoading) {
    return (
      <View className="flex-1 bg-background">
        {header}
        <View className="gap-4 px-4 pt-2">
          <View className="flex-row gap-3">
            <Skeleton className="h-28 flex-1 rounded-3xl" />
            <Skeleton className="h-28 flex-1 rounded-3xl" />
          </View>
          <Skeleton className="h-64 w-full rounded-3xl" />
        </View>
      </View>
    );
  }

  if (vm.error || vm.options.length === 0 || !vm.selectedOption) {
    return (
      <View className="flex-1 bg-background">
        {header}
        <EmptyState
          icon={{ ios: 'creditcard.trianglebadge.exclamationmark', android: 'credit_card_off' }}
          title="No hay métodos de pago"
          description={vm.error ?? 'Esta tienda todavía no tiene métodos de pago configurados.'}
          actionLabel="Volver"
          onPressAction={vm.goBack}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {header}

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-6 px-4 pt-2 pb-6">
        {/* Método de pago de la tienda: desplegable con los que ofrece */}
        <View className="gap-2">
          <SectionTitle>Método de pago</SectionTitle>
          <SelectField
            value={vm.selectedOption.label}
            options={vm.methodLabels}
            onChange={vm.selectMethodByLabel}
            accessibilityLabel="Método de pago"
          />
          <Text className="pl-1 text-xs text-muted">
            {vm.isBolivares ? 'Se paga en bolívares.' : 'Se paga en dólares.'}
          </Text>
        </View>

        {/* Datos para pagar, con copiar */}
        <View className="gap-2">
          <SectionTitle>{`Paga a ${vm.warehouse?.name ?? 'la tienda'}`}</SectionTitle>
          <PaymentDetailsCard
            methodLabel={vm.selectedOption.label}
            details={vm.details}
            copiedKey={vm.copiedKey}
            onCopy={vm.copyDetail}
            onCopyAll={vm.copyAll}
            footnote={
              vm.isBolivares
                ? `Paga el monto exacto. ${vm.rateNote ?? ''}`.trim()
                : 'Paga el monto exacto en dólares.'
            }
          />
        </View>

        {/* Desde dónde pagó (solo bolívares: Pago Móvil / transferencia) */}
        {vm.isBolivares ? (
          <View className="gap-2">
            <SectionTitle
              action={
                vm.selectedPayer ? (
                  <Pressable
                    onPress={vm.addPayer}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="Agregar otro método de pago"
                    className="active:opacity-60">
                    <Text className="text-xs font-medium text-action">+ Nuevo</Text>
                  </Pressable>
                ) : null
              }>
              ¿Desde dónde pagaste?
            </SectionTitle>
            {vm.selectedPayer ? (
              <PressableFeedback
                onPress={vm.openPayerSheet}
                accessibilityRole="button"
                accessibilityLabel={`Pagaste desde ${vm.selectedPayer.alias}, ${payerSummary(vm.selectedPayer)}`}
                accessibilityHint="Toca para elegir otro"
                className="flex-row items-center gap-3 rounded-3xl bg-surface p-3">
                <View className="size-10 items-center justify-center rounded-full bg-default">
                  <SymbolView
                    name={{ ios: 'iphone', android: 'smartphone', web: 'smartphone' }}
                    size={18}
                    tintColor={foreground}
                  />
                </View>
                <View className="min-w-0 flex-1 gap-0.5">
                  <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                    {vm.selectedPayer.alias}
                  </Text>
                  <Text className="text-xs text-muted" numberOfLines={1}>
                    {payerSummary(vm.selectedPayer)}
                  </Text>
                </View>
                <Text className="text-sm font-semibold text-action">Cambiar</Text>
              </PressableFeedback>
            ) : (
              <PressableFeedback
                onPress={vm.addPayer}
                accessibilityRole="button"
                accessibilityLabel="Agregar el método desde donde pagaste"
                className="flex-row items-center gap-3 rounded-3xl border-2 border-dashed border-default bg-surface p-3">
                <View className="size-10 items-center justify-center rounded-full bg-default">
                  <SymbolView
                    name={{ ios: 'plus', android: 'add', web: 'add' }}
                    size={18}
                    tintColor={foreground}
                  />
                </View>
                <View className="flex-1 gap-0.5">
                  <Text className="text-sm font-semibold text-foreground">
                    Agrega desde dónde pagaste
                  </Text>
                  <Text className="text-xs text-muted">
                    Tu Pago Móvil, para que la tienda ubique tu pago.
                  </Text>
                </View>
              </PressableFeedback>
            )}
          </View>
        ) : null}

        {/* Referencia del pago */}
        <TextField isRequired>
          <Label>Referencia del pago</Label>
          {vm.isBolivares ? (
            // Referencias en bolívares: solo números, con teclado propio en una hoja.
            <KeypadField
              value={vm.reference}
              onChange={vm.changeReference}
              maxLength={vm.referenceMaxLength}
              placeholder="Ej. 123456"
              title="Referencia del pago"
              description="Escribe los últimos dígitos del número de referencia."
              accessibilityLabel="Referencia del pago"
            />
          ) : (
            // En dólares (Zelle, Banesco Panamá) el código puede tener letras: teclado normal.
            <FormInput
              value={vm.reference}
              onChangeText={vm.changeReference}
              placeholder="Ej. código de confirmación"
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={vm.referenceMaxLength}
              returnKeyType="done"
            />
          )}
          <Description>
            {vm.isBolivares
              ? 'Los últimos dígitos del número de referencia de tu pago.'
              : 'El código o número de confirmación que te dio tu banco.'}
          </Description>
        </TextField>

        {vm.placeError ? <Text className="text-sm text-danger">{vm.placeError}</Text> : null}
      </ScrollView>

      {/* Total y realizar pedido, fijo abajo */}
      <View
        style={{ paddingBottom: insets.bottom + 12, backgroundColor: background }}
        className="gap-3 px-4 pt-3">
        <View className="flex-row items-baseline justify-between px-1">
          <Text className="text-sm text-muted">Total a pagar</Text>
          <View className="items-end">
            <Text className="text-xl font-bold text-foreground">
              {vm.isBolivares && vm.totalBs !== null
                ? formatBs(vm.totalBs)
                : formatUSD(vm.totalUsd)}
            </Text>
            {vm.isBolivares ? (
              <Text className="text-xs text-muted">{formatUSD(vm.totalUsd)}</Text>
            ) : null}
          </View>
        </View>
        <Button
          size="lg"
          // Sin capa de color al presionar sobre el color de acción.
          feedbackVariant="scale"
          isDisabled={!vm.canPlaceOrder}
          onPress={vm.placeOrder}
          className="rounded-full bg-action">
          {vm.isPlacing ? <Spinner size="sm" color={actionForeground} /> : null}
          <Button.Label className="text-action-foreground">
            {vm.isPlacing ? 'Enviando pedido…' : 'Realizar pedido'}
          </Button.Label>
        </Button>
      </View>

      <OptionsSheet
        isOpen={vm.isPayerSheetOpen}
        onClose={vm.closePayerSheet}
        title="¿Desde dónde pagaste?"
        description="Elige la cuenta con la que hiciste el pago."
        options={vm.payerMethods}
        keyExtractor={(method) => method.id}
        isSelected={(method) => method.id === vm.selectedPayer?.id}
        onSelect={vm.selectPayer}
        getAccessibilityLabel={(method) => `${method.alias}, ${payerSummary(method)}`}
        renderOption={(method) => (
          <>
            <Text className="text-base font-medium text-foreground" numberOfLines={1}>
              {method.alias}
            </Text>
            <Text className="text-sm text-muted" numberOfLines={1}>
              {payerSummary(method)}
            </Text>
          </>
        )}
        isScrollable={vm.payerMethods.length > 6}
      />
    </KeyboardAvoidingView>
  );
}
