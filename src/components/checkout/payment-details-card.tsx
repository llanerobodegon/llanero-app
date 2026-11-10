import { SymbolView } from 'expo-symbols';
import { Separator, useThemeColor } from 'heroui-native';
import { Fragment } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useActionColor } from '@/hooks/use-action-foreground';
import type { PaymentDetail } from '@/lib/payment';

type PaymentDetailsCardProps = {
  /** "Pago Móvil", "Zelle"… */
  methodLabel: string;
  details: PaymentDetail[];
  /** Clave del dato recién copiado (`'all'` para todos), para mostrar el check. */
  copiedKey: string | null;
  onCopy: (detail: PaymentDetail) => void;
  onCopyAll: () => void;
  /** Nota al pie: tasa usada, "paga el monto exacto"… */
  footnote?: string;
};

/** Datos para pagar a la tienda, cada uno con su botón de copiar, y "Copiar todo" arriba. */
export function PaymentDetailsCard({
  methodLabel,
  details,
  copiedKey,
  onCopy,
  onCopyAll,
  footnote,
}: PaymentDetailsCardProps) {
  const [foreground, muted] = useThemeColor(['foreground', 'muted']);
  const actionColor = useActionColor();
  const isAllCopied = copiedKey === 'all';

  return (
    <View className="rounded-3xl bg-surface">
      <View className="flex-row items-center justify-between gap-3 px-4 pb-2 pt-4">
        <Text className="flex-1 text-base font-semibold text-foreground" numberOfLines={1}>
          {methodLabel}
        </Text>
        <Pressable
          onPress={onCopyAll}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={isAllCopied ? 'Datos copiados' : 'Copiar todos los datos'}
          className="flex-row items-center gap-1.5 rounded-full bg-default px-3 py-1.5 active:opacity-60">
          <SymbolView
            name={
              isAllCopied
                ? { ios: 'checkmark', android: 'check', web: 'check' }
                : { ios: 'doc.on.doc', android: 'content_copy', web: 'content_copy' }
            }
            size={13}
            weight="semibold"
            tintColor={isAllCopied ? actionColor : foreground}
          />
          <Text
            className={`text-xs font-semibold ${isAllCopied ? 'text-action' : 'text-foreground'}`}>
            {isAllCopied ? 'Copiado' : 'Copiar todo'}
          </Text>
        </Pressable>
      </View>

      {details.map((detail, index) => {
        const isCopied = copiedKey === detail.key || isAllCopied;
        return (
          <Fragment key={detail.key}>
            <View className="flex-row items-center gap-3 px-4 py-3">
              <View className="flex-1 gap-0.5">
                <Text className="text-xs text-muted">{detail.label}</Text>
                <Text
                  selectable
                  className={
                    detail.isAmount
                      ? 'text-xl font-bold text-foreground'
                      : 'text-base font-medium text-foreground'
                  }
                  style={{ fontVariant: ['tabular-nums'] }}>
                  {detail.value}
                </Text>
              </View>
              <Pressable
                onPress={() => onCopy(detail)}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel={
                  isCopied ? `${detail.label} copiado` : `Copiar ${detail.label.toLowerCase()}`
                }
                className="size-9 items-center justify-center rounded-full bg-default active:opacity-60">
                <SymbolView
                  name={
                    isCopied
                      ? { ios: 'checkmark', android: 'check', web: 'check' }
                      : { ios: 'doc.on.doc', android: 'content_copy', web: 'content_copy' }
                  }
                  size={15}
                  weight="semibold"
                  tintColor={isCopied ? actionColor : muted}
                />
              </Pressable>
            </View>
            {index < details.length - 1 ? <Separator className="mx-4" /> : null}
          </Fragment>
        );
      })}

      {footnote ? (
        <Text className="px-4 pb-4 pt-1 text-xs text-muted">{footnote}</Text>
      ) : (
        <View className="h-2" />
      )}
    </View>
  );
}
