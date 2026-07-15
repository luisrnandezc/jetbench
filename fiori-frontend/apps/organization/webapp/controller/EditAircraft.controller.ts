/// <reference types="@openui5/ts-types" />

import Controller from 'sap/ui/core/mvc/Controller';
import UIComponent from 'sap/ui/core/UIComponent';
import MessageBox from 'sap/m/MessageBox';
import MessageToast from 'sap/m/MessageToast';
import Event from 'sap/ui/base/Event';

import type Router from 'sap/ui/core/routing/Router';
import type ODataModel from 'sap/ui/model/odata/v4/ODataModel';
import type Context from 'sap/ui/model/odata/v4/Context';

/**
 * @namespace jetbench.organization.controller
 */
export default class EditAircraft extends Controller {
  private static readonly UPDATE_GROUP_ID = 'editAircraftGroup';

  public onInit(): void {
    this.getRouter()
      .getRoute('editAircraft')
      ?.attachPatternMatched(this.onRouteMatched, this);
  }

  private getRouter(): Router {
    return (this.getOwnerComponent() as UIComponent).getRouter();
  }

  private getODataModel(): ODataModel {
    return this.getView()?.getModel() as ODataModel;
  }

  private onRouteMatched(oEvent: Event): void {
    const oParameters = oEvent.getParameters() as {
      arguments?: {
        ID?: string;
      };
    };

    const sAircraftID = oParameters.arguments?.ID;

    if (!sAircraftID) {
      MessageBox.error('Missing Aircraft ID in route.');
      this.getRouter().navTo('main');
      return;
    }

    const sPath = `/Aircraft(${sAircraftID})`;

    this.getView()?.setBusy(true);

    this.getView()?.bindElement({
      path: sPath,
      parameters: {
        $expand: 'aircraftModel,defaultEngineModel,engines',
        $$updateGroupId: EditAircraft.UPDATE_GROUP_ID,
      },
      events: {
        change: () => {
          const oContext = this.getView()?.getBindingContext();

          if (!oContext) {
            MessageBox.error(`Aircraft not found for path: ${sPath}.`);
            this.getRouter().navTo('main');
            return;
          }

          this.getView()?.setBusy(false);
        },
        dataRequested: () => {
          this.getView()?.setBusy(true);
        },
        dataReceived: (oDataEvent: Event) => {
          this.getView()?.setBusy(false);

          const oParameters = oDataEvent.getParameters() as {
            error?: unknown;
          };

          if (oParameters.error) {
            MessageBox.error(
              `Failed to load aircraft data for path: ${sPath}. Check Network tab / CAP logs.`,
            );
          }
        },
      },
    });
  }

  public onNavBack(): void {
    this.getRouter().navTo('main', {}, true);
  }

  public onCancel(): void {
    this.getODataModel().resetChanges(EditAircraft.UPDATE_GROUP_ID);
    this.onNavBack();
  }

  public async onSave(): Promise<void> {
    this.getView()?.setBusy(true);

    try {
      await this.getODataModel().submitBatch(EditAircraft.UPDATE_GROUP_ID);
      MessageToast.show('Aircraft updated');
      this.onNavBack();
    } catch (e) {
      MessageBox.error('Update failed. Check the Network tab / CAP logs.');
    } finally {
      this.getView()?.setBusy(false);
    }
  }

  public onDeleteAircraft(): void {
    const oContext = this.getView()?.getBindingContext() as Context | null;

    if (!oContext) {
      MessageBox.error('No aircraft loaded to delete.');
      return;
    }

    const sTailNumber = (oContext.getProperty('tailNumber') as string) ?? '';
    const sSerialNumber =
      (oContext.getProperty('serialNumber') as string) ?? '';

    const sLabel = sTailNumber
      ? `${sTailNumber} (${sSerialNumber})`
      : sSerialNumber;

    MessageBox.confirm(
      `This will permanently delete aircraft ${sLabel}. Do you want to continue?`,
      {
        title: 'Delete Aircraft',
        emphasizedAction: MessageBox.Action.DELETE,
        actions: [MessageBox.Action.DELETE, MessageBox.Action.CANCEL],
        onClose: (sAction: string | null): void => {
          if (sAction !== MessageBox.Action.DELETE) return;

          void this.handleDelete(oContext);
        },
      },
    );
  }

  private async handleDelete(oContext: Context): Promise<void> {
    this.getView()?.setBusy(true);

    try {
      await oContext.delete('$direct');

      MessageToast.show('Aircraft deleted');
      this.onNavBack();
    } catch (e) {
      MessageBox.error('Delete failed. Check Network tab / CAP logs.');
    } finally {
      this.getView()?.setBusy(false);
    }
  }
}
