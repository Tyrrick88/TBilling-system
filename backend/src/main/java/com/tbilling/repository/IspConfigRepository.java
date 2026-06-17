package com.tbilling.repository;

import com.tbilling.domain.IspConfig;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IspConfigRepository extends JpaRepository<IspConfig, UUID> {}
