import UIComponent from 'sap/ui/core/UIComponent';
import Core from 'sap/ui/core/Core';

/**
 * @namespace jetbench.admin
 */
export default class Component extends UIComponent {
  public static metadata = {
    manifest: 'json',
  };

  public init(): void {
    super.init();
    Core.applyTheme('sap_horizon_dark');
  }
}
