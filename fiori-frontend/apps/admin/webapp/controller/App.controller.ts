import Controller from 'sap/ui/core/mvc/Controller';
import type UIComponent from 'sap/ui/core/UIComponent';

/**
 * @namespace jetbench.admin.controller
 */
export default class App extends Controller {
  public onInit(): void {
    const component = this.getOwnerComponent() as UIComponent;
    const router = component.getRouter();
    if (!router) {
      return;
    }

    setTimeout(() => {
      router.initialize();
      router.navTo('main', {}, true);
    }, 0);
  }
}
