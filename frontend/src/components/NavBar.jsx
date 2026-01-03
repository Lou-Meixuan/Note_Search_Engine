import { Link, useLocation } from "react-router-dom";

export default function NavBar() {
    const { pathname } = useLocation();

    const linkStyle = (to) => ({
        marginRight: 12,
        fontWeight: pathname === to ? "700" : "400",
    });

    return (
        <div style={{ padding: 16, borderBottom: "1px solid #eee" }}>
            <Link to="/" style={linkStyle("/")}>Search</Link>
            <Link to="/upload" style={linkStyle("/upload")}>Upload</Link>
        </div>
    );
}
