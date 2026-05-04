import cds from "@sap/cds";
import cors from "cors";

cds.on("bootstrap", (app) => {
  app.use(cors({
    origin: "http://localhost:8080",
    credentials: true,
    exposedHeaders: [
      "OData-Version",
      "OData-MaxVersion",
      "x-csrf-token"
    ]
  }));

  app.use((req, res, next) => {
    res.setHeader("OData-Version", "4.0");
    next();
  });
});

export default cds.server;