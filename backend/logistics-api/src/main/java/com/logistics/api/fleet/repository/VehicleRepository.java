package com.logistics.api.fleet.repository;

import com.logistics.api.fleet.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, String> {
    List<Vehicle> findByActiveTrueOrderByVehicleIdAsc();
    List<Vehicle> findAllByOrderByVehicleIdAsc();
}

