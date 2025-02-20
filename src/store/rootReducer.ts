import { combineReducers } from "@reduxjs/toolkit";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";
import { persistReducer } from "redux-persist";
import { createFilter } from "redux-persist-transform-filter";
import { staticReducer } from "@/slices/static";
import { patientProfileReducer } from "@/slices/patientprofileslice";

export const rootReducer = combineReducers({
  static: staticReducer,
  patientprofileslice: patientProfileReducer
});

const GeneralLookupDataFilter = createFilter("static", ["GeneralLookupData"]);

const createNoopStorage = () => {
  return {
    getItem() {
      return Promise.resolve(null);
    },
    setItem(value: string) {
      return Promise.resolve(value);
    },
    removeItem() {
      return Promise.resolve();
    },
  };
};

const storage =
  typeof window !== "undefined"
    ? createWebStorage("local")
    : createNoopStorage();

export const persistConfig = {
  key: "root",
  storage,
  whitelist: ["static"],
  transforms: [GeneralLookupDataFilter],
};
export const persistedReducer = persistReducer(persistConfig, rootReducer);
