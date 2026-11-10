package com.logistics.api.customer.repository;

import com.logistics.api.customer.entity.CustomerSite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CustomerSiteRepository
        extends JpaRepository<CustomerSite, String> {

    List<CustomerSite> findByRegionId(String regionId);

    List<CustomerSite> findByActive(boolean active);

    boolean existsBySiteNameIgnoreCaseAndRegionId(
            String siteName,
            String regionId
    );
}