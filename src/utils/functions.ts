/* eslint-disable */
import Router from 'next/router';
import SnackbarUtils from "../content/snackbar";
import moment from 'moment';

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
export const setToken = (token,Email?,FirstName?,LastName?,UserAccessType?,PracticeName?) => {
  if (typeof window !== "undefined") {
     localStorage.setItem("token", token);
     localStorage.setItem("Email", Email);
     localStorage.setItem("FirstName", FirstName);
     localStorage.setItem("LastName", LastName);
     localStorage.setItem("UserAccessType", UserAccessType);
     localStorage.setItem("PracticeName", PracticeName);
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
  name: string,
  width: string = "40px",
  height: string = "40px",
  bgcolor: string = "#a0aaba"
) {
  if (!name) return { children: "U" }; // Default "U" for unknown user

  // Extract name before @ if it's an email
  const namePart = name.includes("@") ? name.split("@")[0] : name;

  // Split by spaces or dots
  const nameParts = namePart.split(/[.\s]/);

  // Get first letter of each name part (max 2 characters)
  const initials = nameParts
    .filter((part) => part.length > 0)
    .slice(0, 2) // Max 2 initials
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return {
    sx: {
      bgcolor: bgcolor,
      opacity: "0.9",
      height: height,
      width: width,
    },
    children: initials || "U", // Ensures at least one letter
  };
}

export const formatAddresswithCCDA = (addr) => {
  if (!addr) return '';
 
  const parts = [];
  if (addr.streetAddressLine) parts.push(addr.streetAddressLine);
  if (addr.city || addr.state || addr.postalCode) {
    parts.push(`${addr.city || ''}, ${addr.state || ''} ${addr.postalCode || ''}, ${addr.country || ''}`.trim());
  }
 
  return parts.join('\n');
};

export function formatDateCCDADate(dateString: string): string {
  if (!dateString) return '';
 
  // Check if it's an 8-digit date first (YYYYMMDD)
  const numericOnly = dateString.replace(/\D/g, '');
  if (numericOnly.length === 8) {
    // 8-digit format: YYYYMMDD -> "July 1, 1980"
    const formatted = moment(numericOnly, 'YYYYMMDD');
    return formatted.isValid() ? formatted.format('MMMM D, YYYY') : dateString;
  }
 
  // Handle formats with timezone offset (e.g., 201507221430-0500)
  if (dateString.includes('-') || dateString.includes('+')) {
    // Manual parsing for timezone format
    const parts = dateString.split(/[\-\+]/);
    if (parts.length === 2 && parts[0].length >= 12) {
      const dateTimePart = parts[0];
      const year = dateTimePart.substring(0, 4);
      const month = dateTimePart.substring(4, 6);
      const day = dateTimePart.substring(6, 8);
      const hour = dateTimePart.substring(8, 10);
      const minute = dateTimePart.substring(10, 12);
     
      const formatted = moment(`${year}-${month}-${day} ${hour}:${minute}`, 'YYYY-MM-DD HH:mm');
      if (formatted.isValid()) {
        return `${formatted.format('MMMM D, YYYY, HH:mm')}, EST`;
      }
    }
   
    // Fallback: try parsing with moment's timezone formats
    const formats = ['YYYYMMDDHHMMZZ', 'YYYYMMDDHHMM ZZ'];
    for (const format of formats) {
      const formatted = moment(dateString, format);
      if (formatted.isValid()) {
        return `${formatted.format('MMMM D, YYYY, HH:mm')}, EST`;
      }
    }
  }
 
  // Handle pure numeric formats without timezone (12+ digits)
  if (numericOnly.length >= 12) {
    // 12+ digit format: YYYYMMDDHHMM -> "July 22, 2015, 14:00, EST"
    const formatted = moment(numericOnly.substring(0, 12), 'YYYYMMDDHHMM');
    return formatted.isValid() ? `${formatted.format('MMMM D, YYYY, HH:mm')}, EST` : dateString;
  }
 
  return dateString;
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
