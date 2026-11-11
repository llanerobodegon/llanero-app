import type { AndroidSymbol, SFSymbol } from 'expo-symbols';
import { SymbolView } from 'expo-symbols';
import { ListGroup, PressableFeedback, Separator, useThemeColor } from 'heroui-native';
import { Children, Fragment, type ReactNode } from 'react';
import { Text, View } from 'react-native';

type AccountMenuSectionProps = {
  /** Título pequeño sobre el grupo; opcional. */
  title?: string;
  children: ReactNode;
};

/** Grupo de opciones de la cuenta: título opcional y tarjeta con separadores entre ítems. */
export function AccountMenuSection({ title, children }: AccountMenuSectionProps) {
  const items = Children.toArray(children);

  return (
    <View className="gap-2">
      {title ? (
        <Text className="pl-1 text-sm font-semibold text-muted" accessibilityRole="header">
          {title}
        </Text>
      ) : null}
      {/* Sin sombra: solo los botones la llevan (ListGroup es un Surface y la trae por defecto) */}
      <ListGroup className="overflow-hidden rounded-3xl shadow-none">
        {items.map((item, index) => (
          <Fragment key={index}>
            {item}
            {index < items.length - 1 ? <Separator className="ml-16 mr-4" /> : null}
          </Fragment>
        ))}
      </ListGroup>
    </View>
  );
}

type AccountMenuItemProps = {
  title: string;
  icon: { ios: SFSymbol; android: AndroidSymbol };
  description?: string;
  /** `danger` para acciones destructivas (eliminar cuenta). */
  tone?: 'default' | 'danger';
  /** Sin chevron para acciones que no navegan (cerrar sesión). */
  showChevron?: boolean;
  onPress: () => void;
};

/** Opción de la cuenta: ícono en círculo, título, descripción opcional y chevron. */
export function AccountMenuItem({
  title,
  icon,
  description,
  tone = 'default',
  showChevron = true,
  onPress,
}: AccountMenuItemProps) {
  const [foreground, danger, muted] = useThemeColor(['foreground', 'danger', 'muted']);
  const isDanger = tone === 'danger';

  return (
    <PressableFeedback
      animation={false}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}>
      <PressableFeedback.Highlight />
      <ListGroup.Item disabled>
        <ListGroup.ItemPrefix>
          <View
            className={`size-9 items-center justify-center rounded-full ${
              isDanger ? 'bg-danger/10' : 'bg-default'
            }`}>
            <SymbolView
              name={{ ios: icon.ios, android: icon.android, web: icon.android }}
              size={17}
              tintColor={isDanger ? danger : foreground}
            />
          </View>
        </ListGroup.ItemPrefix>
        <ListGroup.ItemContent>
          <ListGroup.ItemTitle className={isDanger ? 'text-danger' : undefined}>
            {title}
          </ListGroup.ItemTitle>
          {description ? (
            <ListGroup.ItemDescription>{description}</ListGroup.ItemDescription>
          ) : null}
        </ListGroup.ItemContent>
        {showChevron ? <ListGroup.ItemSuffix iconProps={{ size: 14, color: muted }} /> : null}
      </ListGroup.Item>
    </PressableFeedback>
  );
}
