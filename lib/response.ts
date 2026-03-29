import { NextResponse } from "next/server";

export enum HttpCode {
  StatusContinue = 100,
  StatusSwitchingProtocols = 101,
  StatusProcessing = 102,
  StatusEarlyHints = 103,

  StatusOK = 200,
  StatusCreated = 201,
  StatusAccepted = 202,
  StatusNonAuthoritativeInfo = 203,
  StatusNoContent = 204,
  StatusResetContent = 205,
  StatusPartialContent = 206,
  StatusMultiStatus = 207,
  StatusAlreadyReported = 208,
  StatusIMUsed = 226,

  StatusMultipleChoices = 300,
  StatusMovedPermanently = 301,
  StatusFound = 302,
  StatusSeeOther = 303,
  StatusNotModified = 304,
  StatusUseProxy = 305,
  StatusTemporaryRedirect = 307,
  StatusPermanentRedirect = 308,

  StatusBadRequest = 400,
  StatusUnauthorized = 401,
  StatusPaymentRequired = 402,
  StatusForbidden = 403,
  StatusNotFound = 404,
  StatusMethodNotAllowed = 405,
  StatusNotAcceptable = 406,
  StatusProxyAuthRequired = 407,
  StatusRequestTimeout = 408,
  StatusConflict = 409,
  StatusGone = 410,
  StatusLengthRequired = 411,
  StatusPreconditionFailed = 412,
  StatusRequestEntityTooLarge = 413,
  StatusRequestURITooLong = 414,
  StatusUnsupportedMediaType = 415,
  StatusRequestedRangeNotSatisfiable = 416,
  StatusExpectationFailed = 417,
  StatusTeapot = 418,
  StatusMisdirectedRequest = 421,
  StatusUnprocessableEntity = 422,
  StatusLocked = 423,
  StatusFailedDependency = 424,
  StatusTooEarly = 425,
  StatusUpgradeRequired = 426,
  StatusPreconditionRequired = 428,
  StatusTooManyRequests = 429,
  StatusRequestHeaderFieldsTooLarge = 431,
  StatusUnavailableForLegalReasons = 451,

  StatusInternalServerError = 500,
  StatusNotImplemented = 501,
  StatusBadGateway = 502,
  StatusServiceUnavailable = 503,
  StatusGatewayTimeout = 504,
  StatusHTTPVersionNotSupported = 505,
  StatusVariantAlsoNegotiates = 506,
  StatusInsufficientStorage = 507,
  StatusLoopDetected = 508,
  StatusNotExtended = 510,
  StatusNetworkAuthenticationRequired = 511,
}

export function statusText(code: number): string {
  const statusTextMap: Record<number, string> = {
    [HttpCode.StatusContinue]: "Continue",
    [HttpCode.StatusSwitchingProtocols]: "Switching Protocols",
    [HttpCode.StatusProcessing]: "Processing",
    [HttpCode.StatusEarlyHints]: "Early Hints",
    [HttpCode.StatusOK]: "OK",
    [HttpCode.StatusCreated]: "Created",
    [HttpCode.StatusAccepted]: "Accepted",
    [HttpCode.StatusNonAuthoritativeInfo]: "Non-Authoritative Information",
    [HttpCode.StatusNoContent]: "No Content",
    [HttpCode.StatusResetContent]: "Reset Content",
    [HttpCode.StatusPartialContent]: "Partial Content",
    [HttpCode.StatusMultiStatus]: "Multi-Status",
    [HttpCode.StatusAlreadyReported]: "Already Reported",
    [HttpCode.StatusIMUsed]: "IM Used",
    [HttpCode.StatusMultipleChoices]: "Multiple Choices",
    [HttpCode.StatusMovedPermanently]: "Moved Permanently",
    [HttpCode.StatusFound]: "Found",
    [HttpCode.StatusSeeOther]: "See Other",
    [HttpCode.StatusNotModified]: "Not Modified",
    [HttpCode.StatusUseProxy]: "Use Proxy",
    [HttpCode.StatusTemporaryRedirect]: "Temporary Redirect",
    [HttpCode.StatusPermanentRedirect]: "Permanent Redirect",
    [HttpCode.StatusBadRequest]: "Bad Request",
    [HttpCode.StatusUnauthorized]: "Unauthorized",
    [HttpCode.StatusPaymentRequired]: "Payment Required",
    [HttpCode.StatusForbidden]: "Forbidden",
    [HttpCode.StatusNotFound]: "Not Found",
    [HttpCode.StatusMethodNotAllowed]: "Method Not Allowed",
    [HttpCode.StatusNotAcceptable]: "Not Acceptable",
    [HttpCode.StatusProxyAuthRequired]: "Proxy Authentication Required",
    [HttpCode.StatusRequestTimeout]: "Request Timeout",
    [HttpCode.StatusConflict]: "Conflict",
    [HttpCode.StatusGone]: "Gone",
    [HttpCode.StatusLengthRequired]: "Length Required",
    [HttpCode.StatusPreconditionFailed]: "Precondition Failed",
    [HttpCode.StatusRequestEntityTooLarge]: "Request Entity Too Large",
    [HttpCode.StatusRequestURITooLong]: "Request URI Too Long",
    [HttpCode.StatusUnsupportedMediaType]: "Unsupported Media Type",
    [HttpCode.StatusRequestedRangeNotSatisfiable]:
      "Requested Range Not Satisfiable",
    [HttpCode.StatusExpectationFailed]: "Expectation Failed",
    [HttpCode.StatusTeapot]: "I'm a teapot",
    [HttpCode.StatusMisdirectedRequest]: "Misdirected Request",
    [HttpCode.StatusUnprocessableEntity]: "Unprocessable Entity",
    [HttpCode.StatusLocked]: "Locked",
    [HttpCode.StatusFailedDependency]: "Failed Dependency",
    [HttpCode.StatusTooEarly]: "Too Early",
    [HttpCode.StatusUpgradeRequired]: "Upgrade Required",
    [HttpCode.StatusPreconditionRequired]: "Precondition Required",
    [HttpCode.StatusTooManyRequests]: "Too Many Requests",
    [HttpCode.StatusRequestHeaderFieldsTooLarge]:
      "Request Header Fields Too Large",
    [HttpCode.StatusUnavailableForLegalReasons]:
      "Unavailable For Legal Reasons",
    [HttpCode.StatusInternalServerError]: "Internal Server Error",
    [HttpCode.StatusNotImplemented]: "Not Implemented",
    [HttpCode.StatusBadGateway]: "Bad Gateway",
    [HttpCode.StatusServiceUnavailable]: "Service Unavailable",
    [HttpCode.StatusGatewayTimeout]: "Gateway Timeout",
    [HttpCode.StatusHTTPVersionNotSupported]: "HTTP Version Not Supported",
    [HttpCode.StatusVariantAlsoNegotiates]: "Variant Also Negotiates",
    [HttpCode.StatusInsufficientStorage]: "Insufficient Storage",
    [HttpCode.StatusLoopDetected]: "Loop Detected",
    [HttpCode.StatusNotExtended]: "Not Extended",
    [HttpCode.StatusNetworkAuthenticationRequired]:
      "Network Authentication Required",
  };
  return statusTextMap[code] ?? "";
}

export interface ResponseData<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export function jsonResponse<T>(
  data: T,
  status: HttpCode = HttpCode.StatusOK,
): NextResponse<ResponseData<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function okResponse<T>(
  data?: T,
  message?: string,
): NextResponse<ResponseData<T>> {
  return NextResponse.json(
    { success: true, message: message ?? statusText(HttpCode.StatusOK), data },
    { status: HttpCode.StatusOK },
  );
}

export function createdResponse<T>(
  data?: T,
  message?: string,
): NextResponse<ResponseData<T>> {
  return NextResponse.json(
    {
      success: true,
      message: message ?? statusText(HttpCode.StatusCreated),
      data,
    },
    { status: HttpCode.StatusCreated },
  );
}

export function badRequestResponse(
  message?: string,
): NextResponse<ResponseData> {
  return NextResponse.json(
    {
      success: false,
      message: message ?? statusText(HttpCode.StatusBadRequest),
    },
    { status: HttpCode.StatusBadRequest },
  );
}

export function unauthorizedResponse(
  message?: string,
): NextResponse<ResponseData> {
  return NextResponse.json(
    {
      success: false,
      message: message ?? statusText(HttpCode.StatusUnauthorized),
    },
    { status: HttpCode.StatusUnauthorized },
  );
}

export function forbiddenResponse(
  message?: string,
): NextResponse<ResponseData> {
  return NextResponse.json(
    {
      success: false,
      message: message ?? statusText(HttpCode.StatusForbidden),
    },
    { status: HttpCode.StatusForbidden },
  );
}

export function notFoundResponse(message?: string): NextResponse<ResponseData> {
  return NextResponse.json(
    { success: false, message: message ?? statusText(HttpCode.StatusNotFound) },
    { status: HttpCode.StatusNotFound },
  );
}

export function errorResponse(
  message?: string,
  status: HttpCode = HttpCode.StatusInternalServerError,
): NextResponse<ResponseData> {
  return NextResponse.json(
    { success: false, message: message ?? statusText(status) },
    { status },
  );
}
