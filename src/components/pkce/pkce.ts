import crypto from 'crypto-js';
import Base64 from 'crypto-js/enc-base64';

const base64Url = (str: string): string => {
    return str.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

const generateCodeVerifier = (): string => {
    const randomBytes = crypto.lib.WordArray.random(32);
    return base64Url(Base64.stringify(randomBytes));
};

const generateCodeChallenge = (): string => {
    const codeVerifier = sessionStorage.getItem('codeVerifier');
    if (!codeVerifier) {
        throw new Error('Code verifier not found in sessionStorage');
    }
    const hash = crypto.SHA256(codeVerifier);
    return base64Url(Base64.stringify(hash));
}

// btoa 대체 함수
const btoaPolyfill = (str: string): string => {
    return Base64.stringify(crypto.enc.Utf8.parse(str));
}

export {
    base64Url,
    generateCodeVerifier,
    generateCodeChallenge,
    btoaPolyfill
}