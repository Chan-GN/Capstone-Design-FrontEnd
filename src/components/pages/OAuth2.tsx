import React, {useEffect} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import axios from "axios";
import Loading from "../layout/Loading";
import {btoaPolyfill} from "../pkce/pkce"; // pkce.ts에서 btoaPolyfill 함수를 import

const OAuth2: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const asUrl = process.env.REACT_APP_AUTHORIZATION_SERVER_URL;
  const feUrl = process.env.REACT_APP_FRONT_URL;

  useEffect(() => {
    const code = searchParams?.get("code");
    if (code) {
      const client = "client";
      const secret = "secret";
      const verifier = sessionStorage.getItem("codeVerifier");

      const body = new URLSearchParams();
      body.append("client_id", client);
      body.append("grant_type", "authorization_code");
      body.append("code", code);
      body.append("redirect_uri", `${feUrl}/authorized`);
      body.append("code_verifier", verifier || "");

      fetch(`${asUrl}/oauth2/token`, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${btoaPolyfill(`${client}:${secret}`)}`,
        },
        body: body.toString(),
      })
          .then(async (response) => {
            const token = await response.json();
            if (token?.id_token && token?.access_token) {
              const now = new Date();
              const expiresIn = parseInt(token.expires_in);
              const expiresAt = new Date(now.getTime() + expiresIn * 1000);

              sessionStorage.setItem("id_token", token.id_token);
              sessionStorage.setItem("access_token", token.access_token);
              sessionStorage.setItem("refresh_token", token.refresh_token);
              sessionStorage.setItem("expires_at", expiresAt.toString());

              axios.get("/api/check")
                  .then((res) => {
                    const check: boolean = res.data;
                    if (check) {
                      navigate("/");
                    } else if (!check) {
                      navigate("/welcome");
                    }
                  })
                  .catch((err) => {
                    if (err.response?.status === 401) {
                      navigate("/welcome");
                    } else if (err.response?.status === 403) {
                      console.log("권한 x");
                    }
                  });
            }
          })
          .catch((err) => {
            console.log(err);
          });
    }
  }, [searchParams, navigate, asUrl, feUrl]);

  useEffect(() => {
    if (!searchParams?.get("code")) {
      const codeChallenge = sessionStorage.getItem("codeChallenge");
      window.location.href = `${asUrl}/oauth2/authorize?response_type=code&client_id=client&scope=openid&redirect_uri=${feUrl}/authorized&code_challenge=${codeChallenge}&code_challenge_method=S256`;
    }
  }, [searchParams, asUrl, feUrl]);

  return <Loading />;
};

export default OAuth2;