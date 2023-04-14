export const metadata = {
    title: "Realtime",
    description: "Example of realtime app with y.js",
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}
