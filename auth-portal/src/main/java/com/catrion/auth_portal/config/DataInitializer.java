package com.catrion.auth_portal.config;



import com.catrion.auth_portal.entity.Permission;
import com.catrion.auth_portal.entity.Role;
import com.catrion.auth_portal.repository.PermissionRepository;
import com.catrion.auth_portal.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    @Override
    public void run(String... args) {

        Permission profileRead = createPermission("PROFILE_READ");
        Permission profileUpdate = createPermission("PROFILE_UPDATE");

        Permission userRead = createPermission("USER_READ");
        Permission userCreate = createPermission("USER_CREATE");
        Permission userUpdate = createPermission("USER_UPDATE");
        Permission userDisable = createPermission("USER_DISABLE");

        createRole(
                "ROLE_USER",
                Set.of(
                        profileRead,
                        profileUpdate
                )
        );

        createRole(
                "ROLE_ADMIN",
                Set.of(
                        profileRead,
                        profileUpdate,
                        userRead,
                        userCreate,
                        userUpdate,
                        userDisable
                )
        );
    }

    private Permission createPermission(String name) {
        return permissionRepository.findByName(name)
                .orElseGet(() ->
                        permissionRepository.save(
                                Permission.builder()
                                        .name(name)
                                        .build()
                        )
                );
    }

    private Role createRole(String name, Set<Permission> permissions) {

        return roleRepository.findByName(name)
                .map(role -> {
                    role.setPermissions(permissions);
                    return roleRepository.save(role);
                })
                .orElseGet(() ->
                        roleRepository.save(
                                Role.builder()
                                        .name(name)
                                        .permissions(permissions)
                                        .build()
                        )
                );
    }
}
