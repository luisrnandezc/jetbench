/// <reference types="@openui5/ts-types" />

import UIComponent from 'sap/ui/core/UIComponent';
import Controller from 'sap/ui/core/mvc/Controller';
import MessageBox from 'sap/m/MessageBox';
import MessageToast from 'sap/m/MessageToast';
import type Event from 'sap/ui/base/Event';
import type Router from 'sap/ui/core/routing/Router';
import type ODataModel from 'sap/ui/model/odata/v4/ODataModel';
import type Context from 'sap/ui/model/odata/v4/Context';

/**
 * @namespace jetbench.admin.controller
 */
export default class EditAircraft extends Controller {
  private static readonly UPDATE_GROUP_ID = 'editGroup';

  public onInit(): void {
    this.getRouter()
      .getRoute('editAircraft')
      ?.attachPatternMatched(this.onRouteMatched, this);
  }

  /** Typed router helper. */
  private getRouter(): Router {
    return (this.getOwnerComponent() as UIComponent).getRouter();
  }

  /** Convenience helper for the default OData V4 model. */
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

    this.getView()!.setBusy(true);

    this.getView()?.bindElement({
      path: sPath,
      parameters: {
        $expand: 'aircraftModel,organization',
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

          const oError = oParameters.error;

          if (oError) {
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
      MessageBox.error('Update failed. Check the Network tab / CAP logs');
    } finally {
      this.getView()?.setBusy(false);
    }
  }

  public onDeleteAircraft(): void {
    const context = this.getView()?.getBindingContext() as Context | null;

    if (!context) {
      MessageBox.error('No aircraft loaded to delete');
      return;
    }

    const aircraftTailNumber = (context.getProperty('name') as string) ?? '';
    const aircraftSerialNumber = (context.getProperty('code') as string) ?? '';

    const label = aircraftTailNumber
      ? `${aircraftTailNumber} (${aircraftSerialNumber})`
      : aircraftSerialNumber;

    MessageBox.confirm(
      `This will permanently delete aircraft ${label}. Do you want to continue?`,
      {
        title: 'Delete Aircraft',
        emphasizedAction: MessageBox.Action.DELETE,
        actions: [MessageBox.Action.DELETE, MessageBox.Action.CANCEL],
        onClose: (action: string | null): void => {
          if (action !== MessageBox.Action.DELETE) return;
          void this.handleDelete(context);
        },
      },
    );
  }

  private async handleDelete(context: Context): Promise<void> {
    this.getView()?.setBusy(true);

    try {
      // Send DELETE immediately; editGroup batches updates (SAVE uses submitBatch) but never flushes deletes.
      await context.delete('$direct');

      MessageToast.show('Aircraft deleted');
      this.onNavBack();
    } catch (e) {
      MessageBox.error('Delete failed. Check Network tab / CAP logs.');
    } finally {
      this.getView()?.setBusy(false);
    }
  }
}
