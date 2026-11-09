import { render, screen, fireEvent } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import RoleSelector from './RoleSelector';
import solutionState from '../../atoms/solutionState';

jest.mock('../../assets/user.svg?react', () => () => null, { virtual: true });
jest.mock('../../hooks/useIsDesktop', () => ({ useIsDesktop: () => true }));

const roles = [{ id: 'role-1', name: 'Patient' }, { id: 'role-2', name: 'Employee' }];

function renderRoleSelector(props, solution = { id: 'solution-1' }) {
    return render(
        <RecoilRoot initializeState={({ set }) => set(solutionState, solution)}>
            <RoleSelector {...props} />
        </RecoilRoot>
    );
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

    test('renders nothing when not visible', () => {
        renderRoleSelector({ isVisible: false });

        expect(screen.queryByRole('button', { name: 'Select App User Role' })).toBeNull();
        expect(window.mapsindoors.services.SolutionsService.getUserRoles).not.toHaveBeenCalled();
    });

    test('waits for the solution before fetching roles', () => {
        renderRoleSelector({ isVisible: true }, null);

        expect(window.mapsindoors.services.SolutionsService.getUserRoles).not.toHaveBeenCalled();
    });

    test('preselects the role from appUserRoles and applies the picked role', async () => {
        renderRoleSelector({ isVisible: true, appUserRoles: ['Employee'] });

        await screen.findByRole('button', { name: 'Select App User Role' });
        expect(screen.queryByRole('button', { name: 'Patient' })).toBeNull();

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
