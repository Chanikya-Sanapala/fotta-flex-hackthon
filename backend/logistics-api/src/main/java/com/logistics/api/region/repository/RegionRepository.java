
package com.logistics.api.region.repository;

import com.logistics.api.region.entity.Region;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RegionRepository extends JpaRepository<Region, String> {

    boolean existsByRegionNameIgnoreCase(String regionName);
}
