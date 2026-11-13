import { render, screen, fireEvent, act } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import RoleSelector from './RoleSelector';
import solutionState from '../../atoms/solutionState';
import initI18n from '../../i18n/initialize.js';

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

    test('shows the roles after the embedding page asks, preselects from appUserRoles and applies the picked role', async () => {
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

    test('calls onRoleChange once after applying the picked role', async () => {
        const onRoleChange = jest.fn();
        renderRoleSelector({ onRoleChange });

        sendMessage('https://cms.mapsindoors.com');
        await screen.findByRole('button', { name: 'Select App User Role' });
        expect(onRoleChange).not.toHaveBeenCalled();

        openList();
        fireEvent.click(screen.getByRole('button', { name: 'Employee' }));
        expect(setUserRoles).toHaveBeenLastCalledWith([roles[1]]);
        expect(onRoleChange).toHaveBeenCalledTimes(1);
        expect(onRoleChange.mock.invocationCallOrder[0]).toBeGreaterThan(setUserRoles.mock.invocationCallOrder.at(-1));
    });

    test('applies only the preselected role when several roles match appUserRoles', async () => {
        renderRoleSelector({ appUserRoles: ['Patient', 'Employee'] });

        sendMessage('https://cms.mapsindoors.com');
        await screen.findByRole('button', { name: 'Select App User Role' });

        expect(setUserRoles).toHaveBeenCalledTimes(1);
        expect(setUserRoles).toHaveBeenCalledWith([roles[0]]);
        openList();
        expect(screen.getByRole('button', { name: 'Patient' }).getAttribute('aria-pressed')).toBe('true');
        expect(screen.getByRole('button', { name: 'Employee' }).getAttribute('aria-pressed')).toBe('false');
    });

    test('stays hidden and logs the error when the roles request fails', async () => {
        const error = new Error('Network error');
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
        window.mapsindoors.services.SolutionsService.getUserRoles.mockRejectedValue(error);
        renderRoleSelector();

        sendMessage('https://cms.mapsindoors.com');
        await act(async () => {});

        expect(consoleError).toHaveBeenCalledWith('Error getting App User Roles:', error);
        expect(screen.queryByRole('button', { name: 'Select App User Role' })).toBeNull();
        consoleError.mockRestore();
    });

    test('translates its texts, also when i18n is initialized after it mounts', async () => {
        renderRoleSelector();
        act(() => {
            initI18n('da');
        });

        sendMessage('https://cms.mapsindoors.com');
        fireEvent.click(await screen.findByRole('button', { name: 'Vælg App User Role' }));

        expect(screen.getByRole('button', { name: 'Ingen rolle' })).toBeInTheDocument();
    });
});
