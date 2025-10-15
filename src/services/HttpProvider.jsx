/* eslint-disable */
import axios from 'axios';
import { Check_Authentication } from '../utils/functions';
export const BASEURL = process.env.NEXT_PUBLIC_APP_API_PATH;
export const BASEURLV2 = process.env.NEXT_PUBLIC_APP_API_PATH_V2;
export const PPSERVICE = process.env.NEXT_PUBLIC_APP_API_PATH_PPSERVICE;
export const ELIGIBILTYSERVICE = process.env.NEXT_PUBLIC_RCM_ELIGIBILITY;
import SnackbarUtils from '@/content/snackbar';
let token;
let exptoken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IktfbDhKWWxOQXFyZlVEWksxWFZpWSJ9.eyJpc3MiOiJodHRwczovL3dpc2VtYW5pbm5vdmF0aW9ucy51cy5hdXRoMC5jb20vIiwic3ViIjoiYXV0aDB8NjdkMjk3MGFmMDBhY2IwZWFlZTg3NjgwIiwiYXVkIjpbImh0dHBzOi8vZWhyLXBhdGllbnQtcG9ydGFsLmRhdGFxaGVhbHRoLmNvbSIsImh0dHBzOi8vd2lzZW1hbmlubm92YXRpb25zLnVzLmF1dGgwLmNvbS91c2VyaW5mbyJdLCJpYXQiOjE3NDI3OTk3NzAsImV4cCI6MTc0MjgwMDM3MCwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCBhZGRyZXNzIHBob25lIiwiZ3R5IjoicGFzc3dvcmQiLCJhenAiOiJxYUQ5WjdGNEs5UU0yWDU0UU5BYkxCYlQ4ZHYwalFPaSIsInBlcm1pc3Npb25zIjpbXX0.hafqytFA8wO8hbPV1Go7ZRIiXq8lYzuT1rjJ9mdh34BgMjZsyAz9bH251rHAMd0sq0vuYiQIdwX-KiqKy5Ztn4FnW4M8XoD4VXHDDypQ_w3FUmRXqmF5yw-Q9CIigrqeBOiPI9_42qjtXhtRmjk94BujnbvGTmHq_OHxSe9BKuVEDnAbuC1R2HR7LHXNBGZzGNYXMNg9ZsU4N5hXuOIP-QzDOx-sFPDGj1BCX7oluWLETMrUkQQabyD7DSb2Zm2TXssQEqUf9dIbl-IdBp38W0qsNhmadKWFFyIAZXMtMXSVnRrG8JQW1Z6csm2Yn0diwX65l03VZrulwFHnojqN8w';
if (typeof window !== 'undefined') {
  token = localStorage.getItem('token');
}
export const getToken = () =>
  localStorage.getItem('token') ? localStorage.getItem('token') : null;
export async function getApiRequestHeader() {
  return {
    Accept: 'application/json',
    Authorization: `Bearer ${getToken()}`,
    // Authorization: `Bearer ${exptoken}`,
    'Content-Type': 'application/json'
  };
}

export async function getApiRequestHeaderWithoutToken() {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  };
}

export const instance = axios.create({
  baseURL: BASEURL
  // timeout: 160000
  // withCredentials: true
  // For HTTP ONly Cookies Set Credential To True
});
export const PPSERVICEInstance = axios.create({
  baseURL: PPSERVICE,
  timeout: 60000
});
export const instanceV2 = axios.create({
  baseURL: BASEURLV2,
  timeout: 60000
});

export const instanceEligibility = axios.create({
  baseURL: ELIGIBILTYSERVICE,
  timeout: 60000
});

export async function updateHeaders() {
  const header = await getApiRequestHeader();

  instance.defaults.headers = header;
  instanceV2.defaults.headers = header;
  PPSERVICEInstance.defaults.headers = header;
  instanceEligibility.defaults.headers = header;
  // axios.defaults.withCredentials = true;
  // For HTTP ONly Cookies Set Credential To True
}

export async function updateHeadersWithoutToken() {
  const header = await getApiRequestHeaderWithoutToken();

  instance.defaults.headers = header;
  instanceV2.defaults.headers = header;
  PPSERVICEInstance.defaults.headers = header;
  instanceEligibility.defaults.headers = header;
  // axios.defaults.withCredentials = true;
  // For HTTP ONly Cookies Set Credential To True
}

export async function request({ method, url, data, headers, flag }) {
  const token = getToken();

  if (!token) {
    return null;
  }

  if (headers === undefined) {
    await updateHeaders();
  }
  let ptportalrequest =
    flag?.ptportalrequest || data?.featureAndAction?.ptportalrequest;
  let ApiVersion2Req =
    flag?.ApiVersion2Req || data?.featureAndAction?.ApiVersion2Req;

  // const promise =  instance[method](url, data);
  const promise = ptportalrequest
    ? PPSERVICEInstance[method](url, data)
    : ApiVersion2Req
    ? instanceV2[method](url, data)
    : instance[method](url, data);

  let response;
  try {
    response = await promise;
  } catch (error) {
    if (error.response) {
      Check_Authentication(error.response);
    } else {
      // Comment out Something Went Wrong Because of when BE get deployed for split sec api not responding when api get deployed it will recall all something went wrong api's
      SnackbarUtils.error('Something Went Wrong', false);
    }
    throw error.response;
  }

  return response;
}

export async function newRequest({ method, url, data, headers }) {
  if (headers === undefined) {
    await updateHeaders();
  }
  const promise = instance[method](url, data);
  let response;

  try {
    response = await promise;
    localStorage.setItem('isAuthenticated', 'false');
  } catch (error) {
    Check_Authentication(error.response);
    throw error.response;
  }

  if (
    response?.data?.status
      ? response.status.toString().indexOf('2') !== 0
      : response.data.status.toString().indexOf('2') !== 0
  ) {
    throw { response };
  } else {
    return response.data;
  }
}

export async function requestWithoutToken({ method, url, data, headers, flag }) {
  if (headers === undefined) {
    await updateHeadersWithoutToken();
  }
  let ptportalrequest =
    flag?.ptportalrequest || data?.featureAndAction?.ptportalrequest;
  let ApiVersion2Req =
    flag?.ApiVersion2Req || data?.featureAndAction?.ApiVersion2Req;

  // const promise =  instance[method](url, data);
  const promise = ptportalrequest
    ? PPSERVICEInstance[method](url, data)
    : ApiVersion2Req
    ? instanceV2[method](url, data)
    : instance[method](url, data);

  let response;
  try {
    response = await promise;
  } catch (error) {
    if (error.response) {
      Check_Authentication(error.response);
    } else {
      // Comment out Something Went Wrong Because of when BE get deployed for split sec api not responding when api get deployed it will recall all something went wrong api's
      SnackbarUtils.error('Something Went Wrong', false);
    }
    throw error.response;
  }

  return response;
}

export async function get(url, params, flag, featureAndAction, config) {
  for (var key in params) {
    url = url + '' + params[key];
  }
  return request({
    method: 'get',
    url,
    data: { featureAndAction },
    ...config,
    flag
  });
}

export async function getWithoutToken(url, params, flag, featureAndAction, config) {
  for (var key in params) {
    url = url + '' + params[key];
  }
  return requestWithoutToken({
    method: 'get',
    url,
    data: { featureAndAction },
    ...config,
    flag
  });
}

export async function del(url, params, flag, config) {
  return request({ method: 'delete', url, data: { params }, ...config, flag });
}
export async function delbody(url, config) {
  return request({ method: 'delete', url, data, ...config });
}

export async function post(url, data, flag, featureAndAction, config) {
  return request({ method: 'post', url, data, ...config, flag });
}
export async function postWithoutToken(url, data, flag, featureAndAction, config) {
  return requestWithoutToken({ method: 'post', url, data, ...config, flag });
}

export async function put(url, data, flag, featureAndAction, config) {
  return request({ method: 'put', url, data, ...config, flag });
}
export async function patch(url, data, featureAndAction, config) {
  return request({ method: 'patch', url, data, ...config });
}
export const independentRequest = async (url, method, data) => {
  const promise = axios[method](url, data);
  let response;
  try {
    response = await promise;
  } catch (error) {
    throw error.response;
  }
  const payload = response;
  return payload;
};
