This is Nextjs (Frontend) DataQ Health Project With Multiple Applications
test
Libraries And Pakages Used To Develop:

    -> Redux Toolkit

    -> Axios Interceptor

    -> Material Ui

    -> Formik

    -> TypeScript

    -> React Calendars

    -> React Chartjs

Utility Functions location src/function.ts:

The collection of utility functions written in JavaScript. These functions perform various tasks such as manipulating dates, checking authentication status, handling cookies, and more. Here's a breakdown of what each function does:

1. `isEmpty(value)`: Checks if a value is null or an empty string/array.
2. `flattenObject(obj)`: Flattens a nested object into a single-level object.
3. `DateToAge(data)`: Calculates the age based on a given date.
4. `Check_Authentication(response)`: Handles authentication errors and displays appropriate messages.
5. `CapitalFirstLetter(data)`: Capitalizes the first letter of a string.
6. `filterbynameobj(data, name)`: Filters an array of objects based on a specific name.
7. `capitalizeFirstLetter(str)`: Capitalizes the first letter of a string.
8. `capitalizeEveryWord(str)`: Capitalizes the first letter of each word in a string.
9. `setCookie(name, value, days)`: Sets a cookie with the given name, value, and expiration days.
10. `getCookie(name)`: Retrieves the value of a cookie by its name.
11. `eraseCookie(name)`: Removes a cookie by setting its expiration date to the past.
12. `deleteAllCookies()`: Deletes all cookies.
13. `IsParsable(data)`: Checks if a string is a valid JSON and can be parsed.
14. `GenerateStartEndOfDay(date)`: Generates the start and end of the day for a given date.
15. `GenerateStartPast30DayEndOfDay(date)`: Generates the start and end of the past 30 days for a given date.
16. `calculateAge(birthdate)`: Calculates the age based on a given birthdate.
17. `ScrollbarStylingObject`: CSS styling object for customizing scrollbars.
18. `getAllDaysOfWeek(_date)`: Returns an array of all days of the week for a given date.
19. `CheckIfTimeIsBetween(currentTime, _beforeTime, _afterTime)`: Checks if a time is between two other times.
20. `SelectedDaysInMonth(m, y, dayset)`: Returns an array of selected days in a month based on the day of the week.
21. `datetoFormate(param)`: Converts a date to the format MM/DD/YYYY.
22. `TimeIntoMinutes(timeString, format)`: Converts a time string to minutes.
23. `MinutesToTime(totalMinutes, format)`: Converts total minutes to a formatted time string.
24. `GetStartAndEndDateOfWeek(date)`: Returns the start and end dates of the week for a given date.
25. `GetStartAndEndDateOfMonth(date)`: Returns the start and end dates of the month for a given date.
26. `ValueToDay(key)`: Converts a numeric day value to its corresponding weekday.
27. `MostRecentObj(data)`: Finds the most recent object based on the "created_at" property in an array of objects.
28. `hexToRgbA(hex)`: Converts a hexadecimal color code to an RGBA color.
29. `ImageExist(url)`: Checks if an image URL exists.
30. `getTimeInterval(startTime, endTime)`: Calculates the time interval between two times.
31. `calculateDurationForTime(startTime, endTime)`: Calculates the duration between two times.
32. `Toasts(msg)`: Displays a toast message using the `notistack` library.
33. `getDifference(array1, array2)`: Returns the items in `array1` that are not present in `array2`.

more functions

1. `getLatestItemByCategory(items, filterThrough, categoryToFilter)`: This function filters an array of items based on a specific category and returns the latest item according to the "id" property.

2. `getItemByCategory(itemMain, filterThrough)`: This function filters an array of items based on the "code" property and returns the filtered items.

3. `formatNumber(number, string)`: This function formats a number by removing the first character, splitting it into three parts, and formatting it as a phone number.

4. `formatAddress(address1, address2, city, state, zip)`: This function formats an address by concatenating address components and adding commas and spaces where necessary.

5. `SearchValueFromGeneralLookup(GeneralLookupData, code, fromCode, searchFrom, showThis, returnArray)`: This function searches for a specific value in the provided GeneralLookupData based on the provided parameters. It can return either the value itself or the entire object if the `returnArray` parameter is set to `true`.

6. `getPracticeId()`, `getPatientId()`, `getisAuthenticated()`, `setToken()`: These functions retrieve or set values in the localStorage based on specific keys.

7. `getTotalPages(totalRecordCount, recordsPerPage)`: This function calculates the total number of pages based on the total record count and the number of records per page.

8. `stringToColor(string)`: This function converts a string into a hexadecimal color code.

9. `stringAvatar(name1, name2, width, height)`: This function generates an avatar object with initials based on the provided names, width, and height.

10. `convertToUTCDate(dateString)`: This function converts a date string to a UTC date string in ISO format.

11. `capitalizeFirstLetterandsmall(str)`: This function capitalizes the first letter of a string and converts the remaining letters to lowercase.

12. `fullName(first, middle, last, prefix)`: This function generates a full name string based on the provided first, middle, last names, and prefix.

13. `validateFormField(value)`: This function validates a form field value and returns an error message if it is empty.

14. `validateForm(values)`: This function validates an entire form by iterating over the values and applying the `validateFormField` function to each field.

15. `isNull(value)`: This function checks if a value is null, undefined, an empty string, or 0.

16. `generateDateRange(selectedDate)`: This function generates a date range object with a specific start and end time based on the selected date.

17. `AddMinutesToLocalDate(localDateString, minutesToAdd)`: This function adds minutes to a local date string and returns the updated date in different formats.

18. `FeetToMeter(Feets)`, `FeetToCMeter(Feets)`, `PoundToKg(pound)`, `InchToCenti(inch)`: These functions convert measurements between different units.

19. `CalculateBmi(weight, height)`, `CalculateBmiNew(weight, feet, inches)`: These functions calculate the Body Mass Index (BMI) based on weight and height measurements.

20. `dynamicSort(property)`: This function is a helper function used for dynamic sorting of an array of objects based on a specific property.

21. `convertPayloadToCustomData(payload)`: This function converts a payload object into a custom data format based on specific calculations and transformations.

22. `VitalTypeIdFinder(key, vitalName, subVitalName = null, dataArray)`: This function searches for a specific vital type or sub-vital type in an array of data. It iterates over each object in the array and checks if the name matches the provided vital name. If a match is found, it returns the corresponding ID based on the provided key. If the key is "VitalTypeId", it returns the ID of the vital type. If the key is "vitalSubTypeId" and a sub-vital name is provided, it iterates over the subVitalsInfo array and returns the ID of the matching sub-vital type. If no match is found, it returns null.

23. `createPatientVitalspayload(values, vitaltypedata)`: This function creates a payload for patient vitals based on the provided values and vital type data. It initializes an empty array called `payload`. It defines an `addVital` function that takes in vital type and sub-vital type names, value, source, and position as parameters. Inside the `addVital` function, it pushes an object to the `payload` array with properties such as patientId, encounterId, vitalTypeId, vitalSubTypeId, value, source, and position. The vitalTypeId and vitalSubTypeId are obtained using the `VitalTypeIdFinder` function. It then iterates over the `vitalParams` array and calls the `addVital` function for each value in the `values` object. Finally, it returns the `payload` array.

24. `ConvertedData(dataArray, whichKeyValuetoSmaller = 'text')`: This function converts the data in an array by mapping over each item and converting the value of a specific key (defaulted to 'text') to lowercase. It creates a new array called `convertedData` by using the `map` method on the `dataArray`. It converts the value of the specified key to lowercase using the `toLowerCase` method and assigns it to a new property with the same key. It then returns the `convertedData` array.
25. `handleClickWhileLoading `:By using this function, you can easily add or remove loading states as needed without modifying the function itself. This makes it more flexible and allows for easy scalability if you need to include additional loading states in the future.
