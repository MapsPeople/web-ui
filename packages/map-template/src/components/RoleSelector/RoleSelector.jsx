import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import { useRecoilValue } from 'recoil';
import solutionState from '../../atoms/solutionState';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import { usePortalTarget } from '../../hooks/usePortalTarget';
import UserIcon from '../../assets/user.svg?react';
// Same look as the language selector, so it reuses its styles.
import '../LanguageSelector/LanguageSelector.scss';

// Pages on mapsindoors.com (the CMS) and local development may enable the role selector.
const ALLOWED_ORIGIN = /^(https:\/\/([a-z0-9-]+\.)+mapsindoors\.com|http:\/\/(localhost|127\.0\.0\.1)(:\d+)?)$/;

RoleSelector.propTypes = {
    appUserRoles: PropTypes.arrayOf(PropTypes.string)
};

/**
 * Button with a list that switches the active App User Role, so the map shows what that role can see and access.
 * Only shown when a MapsIndoors page that embeds the map (the CMS View tab) asks for it,
 * and only when the solution has App User Roles.
 *
 * @param {Object} props
 * @param {string[]} [props.appUserRoles] - Role names applied on load. The first match is preselected.
 * @returns {JSX.Element|null}
 */
function RoleSelector({ appUserRoles }) {
    const [isVisible, setIsVisible] = useState(false);
    const [roles, setRoles] = useState([]);
    const [selectedRoleId, setSelectedRoleId] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const dropdownRef = useRef(null);
    const toggleButtonRef = useRef(null);
    const portalContainer = usePortalTarget('.role-selector-portal');
    const solution = useRecoilValue(solutionState);
    const isDesktop = useIsDesktop();

    // Tell the embedding page the map is ready, and show the selector if it answers from an allowed origin.
    useEffect(() => {
        function onMessage(event) {
            if (event.data?.type === 'mi-role-selector' && ALLOWED_ORIGIN.test(event.origin)) {
                setIsVisible(true);
            }
        }
        window.addEventListener('message', onMessage);
        if (window.parent !== window) {
            window.parent.postMessage({ type: 'mi-map-ready' }, '*');
        }
        return () => window.removeEventListener('message', onMessage);
    }, []);

    useEffect(() => {
        // Wait for the solution: it is loaded after the API key is set, which the roles request needs.
        if (!isVisible || !solution) return;
        window.mapsindoors.services.SolutionsService.getUserRoles().then(userRoles => {
            setRoles(userRoles);
            setSelectedRoleId(userRoles.find(role => appUserRoles?.includes(role.name))?.id ?? '');
        });
    }, [isVisible, solution, appUserRoles]);

    // Click outside to close (desktop only)
    useEffect(() => {
        if (!(isExpanded && isDesktop)) return;
        function handleClickOutside(event) {
            if (!dropdownRef.current?.contains(event.target) && !toggleButtonRef.current?.contains(event.target)) {
                setIsExpanded(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isExpanded, isDesktop]);

    if (!isVisible || roles.length === 0 || !portalContainer) return null;

    const options = [{ id: '', name: 'No role' }, ...roles];

    function selectRole(roleId) {
        setSelectedRoleId(roleId);
        setIsExpanded(false);
        window.mapsindoors.MapsIndoors.setUserRoles(roles.filter(role => role.id === roleId));
    }

    const toggleButton = (
        <button
            ref={toggleButtonRef}
            className="language-selector__toggle-button"
            onClick={() => setIsExpanded(prev => !prev)}
            aria-haspopup="listbox"
            aria-expanded={isExpanded}
            aria-label="Select App User Role"
            title={options.find(role => role.id === selectedRoleId)?.name}
        >
            <UserIcon />
        </button>
    );

    const roleList = (
        <div className="language-selector__list">
            {options.map(role => (
                <button
                    key={role.id}
                    className={`language-selector__item${role.id === selectedRoleId ? ' language-selector__item--selected' : ''}`}
                    aria-pressed={role.id === selectedRoleId}
                    onClick={() => selectRole(role.id)}
                >
                    {role.name}
                </button>
            ))}
        </div>
    );

    return createPortal(
        isDesktop ? (
            <div className="language-selector__button-container">
                {isExpanded && <div ref={dropdownRef} className="language-selector__container">{roleList}</div>}
                {toggleButton}
            </div>
        ) : (
            <>
                {toggleButton}
                {isExpanded && (
                    <div className="language-selector-overlay">
                        <div className="language-selector-overlay__backdrop" onClick={() => setIsExpanded(false)}></div>
                        <div className="language-selector__container">
                            <div className="language-selector-overlay__header">
                                <button className="language-selector-overlay__exit-button" onClick={() => setIsExpanded(false)} aria-label="Close App User Role selector">
                                    ×
                                </button>
                                <span>Select App User Role</span>
                            </div>
                            {roleList}
                        </div>
                    </div>
                )}
            </>
        ),
        portalContainer
    );
}

export default RoleSelector;
