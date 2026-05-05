import UIComponent from 'sap/ui/core/UIComponent';
import Core from 'sap/ui/core/Core';

/**
 * @namespace jetbench.registry
 */
export default class Component extends UIComponent {
  public static metadata = {
    manifest: 'json',
  };

  public init(): void {
    super.init();
    // Router init runs in App.controller after the shell (sap.m.App) exists.

    Core.applyTheme('sap_horizon_dark');
  }
}
