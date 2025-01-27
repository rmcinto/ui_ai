import "./NavBar.scss";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilm } from "@fortawesome/free-solid-svg-icons/faFilm";
import { faNoteSticky } from "@fortawesome/free-solid-svg-icons/faNoteSticky";
import Button from "@mui/material/Button";
import { faMicrochip } from "@fortawesome/free-solid-svg-icons";

export interface AppNavBarProps {

}

const AppNavBar: React.FC<AppNavBarProps> = ({

}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const navRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!navRef.current) {
            return;
        }
        if (location.pathname === "/annotation") {
            (navRef.current.children[1] as HTMLAnchorElement).focus();
        }
        else {
            (navRef.current.children[0] as HTMLAnchorElement).focus();
        }
    }, [location.pathname]);

    return (
        <div
            className="AppNavBar"
        >
            <FontAwesomeIcon className="AppNavBar-logo" icon={faMicrochip} size="2x" />
            <div className="AppNavBar-title">UI AI</div>
            <Button
                onClick={()=> navigate("/")}
                autoFocus={location.pathname === "/"}
                title="Frame Selection"
                data-is-selected={location.pathname === "/"}
            >
                <FontAwesomeIcon icon={faFilm} />
            </Button>
            <Button
                onClick={()=> navigate("/annotation")}
                autoFocus={location.pathname === "/annotation"}
                title="Annotation"
                data-is-selected={location.pathname === "/annotation"}
            >
                <FontAwesomeIcon icon={faNoteSticky} />
            </Button>
            <div className="spacer" />
            <input type="color" />
        </div>
    );
}
export default AppNavBar;