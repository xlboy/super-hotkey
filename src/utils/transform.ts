import {
  RuntypeSchemaCommonKey,
  RuntypeSchemaCommonKeyObj,
  RuntypeSchemaKeySequence,
  RuntypeSchemaMergedNormalKey,
  RuntypeSchemaModifierKeyArr
} from '../constants/runtypes-schema';
import type { PolymorphicHotkeyParams, UnifiedHotkey } from '../types/entrance';

export function convertPolymorphicHotkeyToUnified(
  hotkey: PolymorphicHotkeyParams
): UnifiedHotkey[] {
  // TODO: 待完善
  [
    RuntypeSchemaCommonKey,
    RuntypeSchemaCommonKeyObj,
    RuntypeSchemaKeySequence,
    RuntypeSchemaMergedNormalKey,
    RuntypeSchemaModifierKeyArr
  ];

  return [];
}
