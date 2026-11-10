package com.logistics.api.delivery.repository;

import com.logistics.api.delivery.entity.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface DeliveryRepository extends JpaRepository<Delivery, String> {

    List<Delivery> findAllByOrderByDeliveryDateDescDeliveryIdAsc();

    List<Delivery> findByStatusIgnoreCaseOrderByDeliveryDateDescDeliveryIdAsc(String status);

    List<Delivery> findByDeliveryDateOrderByDeliveryIdAsc(LocalDate deliveryDate);

    List<Delivery> findByStatusIgnoreCaseAndDeliveryDateOrderByDeliveryIdAsc(String status, LocalDate deliveryDate);
}

