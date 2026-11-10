
package com.logistics.api.region.service;

import com.logistics.api.common.exception.ResourceNotFoundException;
import com.logistics.api.region.dto.RegionRequest;
import com.logistics.api.region.entity.Region;
import com.logistics.api.region.repository.RegionRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class RegionService {

    private final RegionRepository regionRepository;

    public RegionService(RegionRepository regionRepository) {
        this.regionRepository = regionRepository;
    }

    // Get all regions
    @Transactional(readOnly = true)
    public List<Region> getAllRegions() {
        return regionRepository.findAll();
    }

    // Get region by ID
    @Transactional(readOnly = true)
    public Region getRegionById(String id) {
        return regionRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Region not found: " + id
                        )
                );
    }

    // Create a new region
    public Region createRegion(RegionRequest request) {

        validateCoordinates(request);

        if (regionRepository.existsById(request.regionId())) {
            throw new IllegalArgumentException(
                    "Region ID already exists: " + request.regionId()
            );
        }

        if (regionRepository.existsByRegionNameIgnoreCase(
                request.regionName())) {

            throw new IllegalArgumentException(
                    "Region name already exists: " + request.regionName()
            );
        }

        Region region = new Region();

        copyRequest(region, request);

        return regionRepository.save(region);
    }

    // Update an existing region
    public Region updateRegion(String id, RegionRequest request) {

        validateCoordinates(request);

        Region region = getRegionById(id);

        if (!id.equals(request.regionId())) {
            throw new IllegalArgumentException(
                    "Region ID cannot be changed during update"
            );
        }

        boolean duplicateName =
                regionRepository.existsByRegionNameIgnoreCase(
                        request.regionName()
                )
                && !region.getRegionName().equalsIgnoreCase(
                        request.regionName()
                );

        if (duplicateName) {
            throw new IllegalArgumentException(
                    "Another region already uses this name"
            );
        }

        copyRequest(region, request);

        return regionRepository.save(region);
    }

    // Delete a region
    public void deleteRegion(String id) {

        Region region = getRegionById(id);

        regionRepository.delete(region);
    }

    // Validate geographical coordinates
    private void validateCoordinates(RegionRequest request) {

        if (request.minLatitude().compareTo(
                request.maxLatitude()) > 0) {

            throw new IllegalArgumentException(
                    "Minimum latitude cannot exceed maximum latitude"
            );
        }

        if (request.minLongitude().compareTo(
                request.maxLongitude()) > 0) {

            throw new IllegalArgumentException(
                    "Minimum longitude cannot exceed maximum longitude"
            );
        }
    }

    // Copy request data into Region entity
    private void copyRequest(
            Region region,
            RegionRequest request) {

        region.setRegionId(request.regionId().trim());

        region.setRegionName(request.regionName().trim());

        region.setMinLatitude(request.minLatitude());

        region.setMaxLatitude(request.maxLatitude());

        region.setMinLongitude(request.minLongitude());

        region.setMaxLongitude(request.maxLongitude());
    }
}
