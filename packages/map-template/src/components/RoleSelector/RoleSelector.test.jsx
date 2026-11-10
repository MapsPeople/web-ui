import { render, screen, fireEvent, act } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import RoleSelector from './RoleSelector';
import solutionState from '../../atoms/solutionState';

jest.mock('../../assets/user.svg?react', () => () => null, { virtual: true });
jest.mock('../../hooks/useIsDesktop', () => ({ useIsDesktop: () => true }));

const roles = [{ id: 'role-1', name: 'Patient' }, { id: 'role-2', name: 'Employee' }];

function renderRoleSelector(props = {}, solution = { id: 'solution-1' }) {
    return render(
        <RecoilRoot initializeState={({ set }) => set(solutionState, solution)}>
            <RoleSelector {...props} />
        </RecoilRoot>
    );
}

function sendMessage(origin, type = 'mi-role-selector') {
    act(() => {
        window.dispatchEvent(new MessageEvent('message', { data: { type }, origin }));
    });
}

function openList() {
    fireEvent.click(screen.getByRole('button', { name: 'Select App User Role' }));
}

describe('RoleSelector', () => {
    const setUserRoles = jest.fn();

    beforeEach(() => {
        document.body.innerHTML = '<div class="role-selector-portal"></div>';
        setUserRoles.mockClear();
        window.mapsindoors = {
            services: { SolutionsService: { getUserRoles: jest.fn().mockResolvedValue(roles) } },
            MapsIndoors: { setUserRoles }
        };
    });

    afterEach(() => {
        delete window.mapsindoors;
    });

    test('stays hidden until a MapsIndoors page asks for it', () => {
        renderRoleSelector();

        sendMessage('https://example.com');
        sendMessage('https://cms.mapsindoors.com.example.com');
        sendMessage('https://cms.mapsindoors.com', 'other-message');

        expect(window.mapsindoors.services.SolutionsService.getUserRoles).not.toHaveBeenCalled();
    });

    test('waits for the solution before fetching roles', () => {
        renderRoleSelector({}, null);

        sendMessage('https://cms.mapsindoors.com');

        expect(window.mapsindoors.services.SolutionsService.getUserRoles).not.toHaveBeenCalled();
    });

    test('shows the roles after the CMS asks, preselects from appUserRoles and applies the picked role', async () => {
        renderRoleSelector({ appUserRoles: ['Employee'] });

        sendMessage('https://cms.mapsindoors.com');
        await screen.findByRole('button', { name: 'Select App User Role' });

        openList();
        expect(screen.getByRole('button', { name: 'Employee' }).getAttribute('aria-pressed')).toBe('true');

        fireEvent.click(screen.getByRole('button', { name: 'Patient' }));
        expect(setUserRoles).toHaveBeenLastCalledWith([roles[0]]);
        expect(screen.queryByRole('button', { name: 'Patient' })).toBeNull();

        openList();
        fireEvent.click(screen.getByRole('button', { name: 'No role' }));
        expect(setUserRoles).toHaveBeenLastCalledWith([]);
    });
});
