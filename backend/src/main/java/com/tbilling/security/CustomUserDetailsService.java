package com.tbilling.security;

import com.tbilling.repository.UserAccountRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomUserDetailsService implements UserDetailsService {
  private final UserAccountRepository users;

  public CustomUserDetailsService(UserAccountRepository users) {
    this.users = users;
  }

  @Override
  @Transactional(readOnly = true)
  public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
    return users
        .findByEmailIgnoreCase(email)
        .map(AuthenticatedUser::new)
        .orElseThrow(() -> new UsernameNotFoundException("User not found"));
  }
}
