import React from "react";
import { Helmet } from "react-helmet";

export default function SEO({ title, description, keywords }) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta charSet="utf-8" />
      <link rel="canonical" href="https://lifelinkhome.com/" />
    </Helmet>
  );
}
