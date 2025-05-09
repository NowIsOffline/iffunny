import Script from 'next/script';

export default function GoogleCode() {
    console.log(process.env.NODE_ENV)
    if (process.env.NODE_ENV !== 'production') {
        return null; // 开发环境不加载 GA 脚本
    }

    return (
        <>
            <Script
                strategy="afterInteractive"
                src="https://www.googletagmanager.com/gtag/js?id=G-W3FSQNE2JY"
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-W3FSQNE2JY');
        `}
            </Script>

        </>
    );
}