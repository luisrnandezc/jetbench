namespace jetbench;

entity AircraftModel {
  key ID          : UUID;
      code        : String(20);
      name        : String(100);
      manufacturer: String(100);
      numberOfEngines: Integer;
      engineType: String(20);
}

entity Aircraft {
  key ID              : UUID;
      tailNumber      : String(20);
      serialNumber    : String(50);
      aircraftModel   : Association to AircraftModel;
      totalFlightHours: Decimal(10,2);
      totalCycles     : Integer;
      installedEngineModel : Association to EngineModel;
}

entity EngineModel {
  key ID          : UUID;
      code        : String(20);
      name        : String(100);
      manufacturer: String(100);
}

entity Engine {
  key ID                 : UUID;
      engineSerialNumber : String(50);
      positionCode       : String(10);
      engineModel        : Association to EngineModel;
      aircraft           : Association to Aircraft;
      totalFlightHours   : Decimal(10,2);
      totalCycles        : Integer;
}

entity Technician {
  key ID             : UUID;
      employeeNumber : String(20);
      fullName       : String(100);
}