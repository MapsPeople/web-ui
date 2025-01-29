import './Header.css';
import logo from './assets/logo.png';

/**
 * This is a simple header component that displays an imaginary website header for a DigiSpaces company
 * and a mocked, non-functioning navigation menu.
 */
function Header() {
    return <header className="header">
        <h1 className="header__heading">
            <img src={logo} alt="DigiSpaces logo" />
            DigiSpaces
        </h1>
        <nav className="header__nav">
            <ul>
                <li><a href="#">Home</a></li>
                <li><a className="active-link" href="#">Map</a></li>
                <li><a href="#">Reports</a></li>
            </ul>
        </nav>
    </header>;
}

export default Header;
