<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>XML Sitemap</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <style type="text/css">
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
            background-color: #050505;
            color: #f4f4f5;
            margin: 0;
            padding: 40px;
          }
          #content {
            max-width: 900px;
            margin: 0 auto;
          }
          h1 {
            color: #fff;
            font-size: 28px;
            font-weight: 800;
            margin-bottom: 10px;
            letter-spacing: -0.025em;
          }
          p {
            color: #a1a1aa;
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 30px;
          }
          a {
            color: #f97316;
            text-decoration: none;
            transition: color 0.2s;
          }
          a:hover {
            color: #fdba74;
            text-decoration: underline;
          }
          table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            background-color: #09090b;
            border: 1px solid #27272a;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
          }
          th {
            text-align: left;
            padding: 16px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #f97316;
            border-bottom: 1px solid #27272a;
            background-color: #09090b;
          }
          td {
            padding: 16px;
            font-size: 13px;
            color: #d4d4d8;
            border-bottom: 1px solid #27272a;
          }
          tr:last-child td {
            border-bottom: none;
          }
          tr:hover td {
            background-color: rgba(249, 115, 22, 0.03);
          }
          .url-cell {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          }
          .header-glow {
            display: inline-block;
            padding: 4px 10px;
            background-color: rgba(249, 115, 22, 0.1);
            border: 1px solid rgba(249, 115, 22, 0.2);
            color: #f97316;
            border-radius: 6px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 15px;
          }
        </style>
      </head>
      <body>
        <div id="content">
          <div class="header-glow">XML Sitemap Feed</div>
          <h1>System Sitemap</h1>
          <p>
            This is an XML Sitemap generated for search engines to discover content on this site.
            <br/>
            You can find more information about XML sitemaps on <a href="https://sitemaps.org" target="_blank" rel="noreferrer">sitemaps.org</a>.
          </p>
          
          <xsl:if test="count(sitemap:sitemapindex/sitemap:sitemap) &gt; 0">
            <p>This sitemap index contains <strong><xsl:value-of select="count(sitemap:sitemapindex/sitemap:sitemap)"/></strong> sitemaps.</p>
            <table>
              <thead>
                <tr>
                  <th>Sitemap URL</th>
                  <th width="20%">Last Modified</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="sitemap:sitemapindex/sitemap:sitemap">
                  <tr>
                    <td class="url-cell">
                      <a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a>
                    </td>
                    <td>
                      <xsl:value-of select="concat(substring(sitemap:lastmod,0,11),concat(' ', substring(sitemap:lastmod,12,5)),concat(' ', substring(sitemap:lastmod,20,6)))"/>
                    </td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </xsl:if>
          
          <xsl:if test="count(sitemap:urlset/sitemap:url) &gt; 0">
            <p>This sitemap contains <strong><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></strong> URLs.</p>
            <table>
              <thead>
                <tr>
                  <th>URL Location</th>
                  <th width="15%">Priority</th>
                  <th width="15%">Change Frequency</th>
                  <th width="20%">Last Modified</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="sitemap:urlset/sitemap:url">
                  <tr>
                    <td class="url-cell">
                      <a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a>
                    </td>
                    <td><xsl:value-of select="sitemap:priority"/></td>
                    <td><xsl:value-of select="sitemap:changefreq"/></td>
                    <td><xsl:value-of select="sitemap:lastmod"/></td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </xsl:if>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
