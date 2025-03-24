/* eslint-disable */
import Router from 'next/router';
import SnackbarUtils from "../content/snackbar";

export const Check_Authentication = async (response) => {
  if (response?.status === 500) {
    const resp = response;
    if (resp?.data?.responseException) {
      if (typeof resp?.data?.responseException?.exceptionMessage === "string") {
        let errorMessage = resp?.data?.responseException?.exceptionMessage;
        SnackbarUtils.error(errorMessage, false);
      } else if (Object.keys(resp?.data?.responseException)?.length > 0) {
        SnackbarUtils.error(
          (resp?.data?.responseException?.exceptionMessage ||
            response?.statusText) +
          " Status Code: " +
          response?.status,
          false
        );
      } else {
        SnackbarUtils.error(
          response?.statusText + " Status Code: " + response?.status,
          false
        );
      }
    } else {
      SnackbarUtils.error(
        response?.statusText + " Status Code: " + response?.status,
        false
      );
    }

    localStorage.setItem("isAuthenticated", "false");
  } 
  else if (response?.status === 401){
    localStorage.clear();
    Router.push(process.env.NEXT_PUBLIC_ORIGIN_URI);
  }
  else if (response?.status === 400) {
    const resp = response;
    if (resp?.data?.responseException) {
      let errorMessage;
      if (Array.isArray(resp?.data?.responseException?.exceptionMessage)) {
        errorMessage = resp?.data?.responseException?.exceptionMessage?.title;
      } else if (
        typeof resp?.data?.responseException?.exceptionMessage === "string"
      ) {
        errorMessage = resp?.data?.responseException?.exceptionMessage;
      } else if (
        typeof resp?.data?.responseException?.exceptionMessage?.errorMessage ===
        "string"
      ) {
        errorMessage =
          resp?.data?.responseException?.exceptionMessage?.errorMessage;
      } else if (
        typeof resp?.data?.responseException?.exceptionMessage?.message ===
        "string"
      ) {
        errorMessage = resp?.data?.responseException?.exceptionMessage?.message;
      } else if (
        resp?.data?.responseException?.exceptionMessage?.error?.message
      ) {
        errorMessage =
          resp?.data?.responseException?.exceptionMessage?.error?.message;
      } else {
        errorMessage = "An unknown error occurred.";
      }

      SnackbarUtils.error(errorMessage, false);
    } else {
      SnackbarUtils.error(
        resp?.statusText + " Status Code: " + resp?.status,
        false
      );
    }
    localStorage.setItem("isAuthenticated", "false");
  } else if (response?.status === 404) {
    const resp = response;

    if (resp?.data?.responseException) {
      let errorMessage;
      if (typeof resp?.data?.responseException?.exceptionMessage === "string") {
        errorMessage = resp?.data?.responseException?.exceptionMessage;
      } else if (
        typeof resp?.data?.responseException?.exceptionMessage?.errorMessage ===
        "string"
      ) {
        errorMessage =
          resp?.data?.responseException?.exceptionMessage?.errorMessage;
      } else if (
        typeof resp?.data?.responseException?.exceptionMessage?.message ===
        "string"
      ) {
        errorMessage = resp?.data?.responseException?.exceptionMessage?.message;
      } else {
        errorMessage = "An unknown error occurred.";
      }

      SnackbarUtils.error(errorMessage, false);
    } else {
      SnackbarUtils.error(`Data/record doesn't exist.`, false);
    }
    // Router.back();
  } else if (response?.status === 409) {
    return response;
  }
};

export const CapitalFirstLetter = (data) => {
  return data?.charAt(0)?.toUpperCase() + data?.slice(1);
};

export const filterbynameobj = (data, name) => {
  const datafil = data;
  datafil?.filter((item) => item?.name === name);
  return datafil;
};

export function capitalizeFirstLetter(str) {
  const capitalized = str.charAt(0).toUpperCase() + str.slice(1);
  return capitalized;
}

export function TruncateStringToLimit(length, str) {
  // Check if the length is valid and the string is longer than the specified length
  if (length >= 0 && str.length > length) {
    // Truncate the string and return
    return str.slice(0, length);
  } else {
    // If the length is invalid or the string is shorter than or equal to the specified length, return the original string
    return str;
  }
}

export function RemoveLeadingSpacesInString(inputString) {
  return inputString.replace(/^\s+/, "");
}
export function Capitalizefirstlettereveryword(str) {
  if (str) {
    str = (str + "")?.toLowerCase();
    return str?.replace(/^([a-z])|\s+([a-z])/g, function ($1) {
      return $1?.toUpperCase();
    });
  } else {
    return "";
  }
}
export function capitalizeEveryWord(str) {
  if (!str || str.trim().length === 0) {
    return "";
  }

  const words = str.split(/\s+/);
  const capitalizedWords = words.map((word) => {
    const firstChar = word.charAt(0).toUpperCase();
    const restOfWord = word.slice(1).toLowerCase();
    return `${firstChar}${restOfWord}`;
  });

  return capitalizedWords.join(" ");
}

export const IsParsable = (data) => {
  try {
    JSON.parse(data);
  } catch {
    return false;
  }
  return true;
};

// Get Practice Id
export const getLocationId = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("locationId")
      ? Number(localStorage.getItem("locationId"))
      : null;
  }
};
export const getProviderId = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("providerId")
      ? Number(localStorage.getItem("providerId"))
      : null;
  }
};
export const getPracticeId = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("practiceId")
      ? localStorage.getItem("practiceId")
      : null;
  }
};
export const getPatientId = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("patientid")
      ? localStorage.getItem("patientid")
      : null;
  }
};
export const getisAuthenticated = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("isAuthenticated")
      ? localStorage.getItem("isAuthenticated")
      : null;
  }
};
export const setToken = (token,Email?,FirstName?,LastName?,UserAccessType?) => {
  if (typeof window !== "undefined") {
     localStorage.setItem("token", token);
     localStorage.setItem("Email", Email);
     localStorage.setItem("FirstName", FirstName);
     localStorage.setItem("LastName", LastName);
     localStorage.setItem("UserAccessType", UserAccessType);
     return;
  }
};

export const getTotalPages = (totalRecordCount, recordsPerPage) => {
  return Math.ceil(totalRecordCount / recordsPerPage);
};

export function stringToColor(string: string) {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}

export function stringAvatar(
  name1: string,
  width: string = "40px",
  height: string = "40px",
  bgcolor: string = "#a0aaba"
) {
  name1 = name1?.replace(/\s/g, "");

  return {
    sx: {
      bgcolor: bgcolor,
      opacity: "0.9",
      height: height,
      width: width,
    },
    children: `${name1?.[0]?.toUpperCase()}`,
  };
}


export function isNumber(value) {
  return typeof value === "number";
}
// null checking method
export const isNull = (value) => {
  if (
    value === "" ||
    value === undefined ||
    value === null ||
    value === 0 ||
    value === "undefined"
  ) {
    return true;
  } else {
    return false;
  }
};
