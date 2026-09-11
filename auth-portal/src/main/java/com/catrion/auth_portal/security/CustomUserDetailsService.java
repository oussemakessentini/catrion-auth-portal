package com.catrion.auth_portal.security;

import com.catrion.auth_portal.entity.User;
import com.catrion.auth_portal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found"));

        var authorities = user.getRoles()
                .stream()
                .flatMap(role -> {
                    var roleAuthority =
                            new SimpleGrantedAuthority(role.getName());

                    var permissionAuthorities =
                            role.getPermissions()
                                    .stream()
                                    .map(permission ->
                                            new SimpleGrantedAuthority(
                                                    permission.getName()
                                            ));

                    return java.util.stream.Stream.concat(
                            java.util.stream.Stream.of(roleAuthority),
                            permissionAuthorities
                    );
                })
                .collect(Collectors.toSet());

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .authorities(authorities)
                .disabled(!user.isEnabled())
                .build();
    }
}
