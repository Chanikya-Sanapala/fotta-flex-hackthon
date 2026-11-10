package com.logistics.api.customer.service;

import com.logistics.api.common.exception.ResourceNotFoundException;
import com.logistics.api.customer.dto.CustomerSiteRequest;
import com.logistics.api.customer.entity.CustomerSite;
import com.logistics.api.customer.repository.CustomerSiteRepository;
import com.logistics.api.region.repository.RegionRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CustomerSiteService {

    private final CustomerSiteRepository customerSiteRepository;
    private final RegionRepository regionRepository;

    public CustomerSiteService(
            CustomerSiteRepository customerSiteRepository,
            RegionRepository regionRepository) {

        this.customerSiteRepository = customerSiteRepository;
        this.regionRepository = regionRepository;
    }

    public CustomerSite createSite(CustomerSiteRequest request) {

        validateRegion(request.regionId());

        if (customerSiteRepository.existsById(request.siteId())) {
            throw new IllegalArgumentException(
                    "Customer site ID already exists: " + request.siteId()
            );
        }

        if (customerSiteRepository.existsBySiteNameIgnoreCaseAndRegionId(
                request.siteName(), request.regionId())) {

            throw new IllegalArgumentException(
                    "A site with this name already exists in the region"
            );
        }

        CustomerSite site = new CustomerSite();

        mapRequestToEntity(request, site);

        return customerSiteRepository.save(site);
    }

    @Transactional(readOnly = true)
    public List<CustomerSite> getAllSites() {
        return customerSiteRepository.findAll();
    }

    @Transactional(readOnly = true)
    public CustomerSite getSiteById(String siteId) {

        return customerSiteRepository.findById(siteId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Customer site not found: " + siteId
                ));
    }

    @Transactional(readOnly = true)
    public List<CustomerSite> getSitesByRegion(String regionId) {

        validateRegion(regionId);

        return customerSiteRepository.findByRegionId(regionId);
    }

    public CustomerSite updateSite(
            String siteId,
            CustomerSiteRequest request) {

        CustomerSite existingSite = getSiteById(siteId);

        validateRegion(request.regionId());

        if (!existingSite.getSiteName().equalsIgnoreCase(request.siteName())
                || !existingSite.getRegionId().equals(request.regionId())) {

            if (customerSiteRepository.existsBySiteNameIgnoreCaseAndRegionId(
                    request.siteName(), request.regionId())) {

                throw new IllegalArgumentException(
                        "A site with this name already exists in the region"
                );
            }
        }

        mapRequestToEntity(request, existingSite);

        return customerSiteRepository.save(existingSite);
    }

    public void deleteSite(String siteId) {

        CustomerSite site = getSiteById(siteId);

        customerSiteRepository.delete(site);
    }

    private void validateRegion(String regionId) {

        if (!regionRepository.existsById(regionId)) {
            throw new ResourceNotFoundException(
                    "Region not found: " + regionId
            );
        }
    }

    private void mapRequestToEntity(
            CustomerSiteRequest request,
            CustomerSite site) {

        site.setSiteId(request.siteId());
        site.setRegionId(request.regionId());
        site.setSiteName(request.siteName());
        site.setAddress(request.address());
        site.setLatitude(request.latitude());
        site.setLongitude(request.longitude());
        site.setSiteType(request.siteType());

        site.setActive(
                request.active() == null || request.active()
        );
    }
}