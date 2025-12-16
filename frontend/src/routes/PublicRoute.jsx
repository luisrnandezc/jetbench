import { Navigate } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";

export default function PublicRoute({ children }) {
    const { user } = useContext(AuthContext);

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}