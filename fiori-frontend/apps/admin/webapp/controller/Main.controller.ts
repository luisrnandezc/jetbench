import Controller from 'sap/ui/core/mvc/Controller';
import MessageToast from 'sap/m/MessageToast';
import MessageBox from 'sap/m/MessageBox';
import type Input from 'sap/m/Input';
import type ODataModel from 'sap/ui/model/odata/v4/ODataModel';

/**
 * @namespace jetbench.admin.controller
 */
export default class Main extends Controller {
  public onOpenCreateDialog(): void {
    const oDialog = this.byId('createOrganizationDialog');
    if (oDialog) {
      (oDialog as any).open();
    }
  }

  public onCloseCreateDialog(): void {
    const oDialog = this.byId('createOrganizationDialog');
    if (oDialog) {
      (oDialog as any).close();
    }
  }

  public onCreateOrganization(): void {
    const oView = this.getView();
    const sName = (oView?.byId('orgNameInput') as Input).getValue().trim();
    const sCode = (oView?.byId('orgCodeInput') as Input).getValue().trim();
    const sCountry = (oView?.byId('orgCountryInput') as Input)
      .getValue()
      .trim();

    if (!sName || !sCode || !sCountry) {
      MessageToast.show('Please fill name, code and country.');
      return;
    }

    const oModel = oView?.getModel() as ODataModel;
    const oListBinding = oModel.bindList('/Organizations');
    oListBinding.create({
      name: sName,
      code: sCode,
      country: sCountry,
    });

    oModel
      .submitBatch(oModel.getUpdateGroupId())
      .then(() => {
        this.onCloseCreateDialog();
        (oView?.byId('orgNameInput') as Input).setValue('');
        (oView?.byId('orgCodeInput') as Input).setValue('');
        (oView?.byId('orgCountryInput') as Input).setValue('');
        MessageToast.show('Organization created.');
      })
      .catch(() => {
        MessageBox.error('Could not create organization.');
      });
  }
}
