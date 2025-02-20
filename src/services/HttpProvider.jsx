/* eslint-disable */
import axios from 'axios';
import { Check_Authentication } from '../utils/functions';
export const BASEURL = process.env.NEXT_PUBLIC_APP_API_PATH;
export const BASEURLV2 = process.env.NEXT_PUBLIC_APP_API_PATH_V2;
export const PPSERVICE = process.env.NEXT_PUBLIC_APP_API_PATH_PPSERVICE;
export const ELIGIBILTYSERVICE = process.env.NEXT_PUBLIC_RCM_ELIGIBILITY;
import SnackbarUtils from '@/content/snackbar';
let token;
if (typeof window !== 'undefined') {
  token = localStorage.getItem('token');
}
export const getToken = () =>
  localStorage.getItem('token') ? localStorage.getItem('token') : null;
export async function getApiRequestHeader() {
  return {
    Accept: 'application/json',
    Authorization: `Bearer ${getToken()}`,
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

export async function del(url, params, flag, config) {
  return request({ method: 'delete', url, data: { params }, ...config, flag });
}
export async function delbody(url, config) {
  return request({ method: 'delete', url, data, ...config });
}

export async function post(url, data, flag, featureAndAction, config) {
  return request({ method: 'post', url, data, ...config, flag });
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
