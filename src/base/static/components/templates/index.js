import { lazy } from "react";

import ShaTemplate from "./sha";
const DashboardTemplate = lazy(() => import("./dashboard"));
const ListTemplate = lazy(() => import("./place-list"));
const MapTemplate = lazy(() => import("./map"));

export { DashboardTemplate, ListTemplate, MapTemplate, ShaTemplate };
