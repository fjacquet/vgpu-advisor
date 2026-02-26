# Sizing Reference — vGPU Advisor

This document explains the infrastructure limits used as slider boundaries in vGPU Advisor.
All values are based on official vendor documentation as of early 2026.

---

## vSphere / ESXi Cluster Limits

| Platform | Max hosts per cluster | Max VMs per host | Max hosts per vCenter |
|----------|----------------------|------------------|-----------------------|
| vSphere 7 | **64** | 1,024 | 2,500 |
| vSphere 8 | **64** | 1,024 | 2,500 |
| vSphere 9 | **128** | ~12,000 VMs/cluster | 2,500 |

**VDI best practice**: 8–16 hosts per cluster (allows n+1 HA without excessive blast radius).

Sources:
- [Broadcom Configuration Maximums tool](https://configmax.broadcom.com/guest?vmwareproduct=vSphere&release=vSphere+8.0)
- [virten.net vSphere Config Maximums](https://www.virten.net/vmware/vmware-vsphere-esx-and-vcenter-configuration-maximums/)

---

## Omnissa Horizon Pod / Cloud Pod Architecture

| Boundary | Limit |
|----------|-------|
| Connection Servers per pod | 7 |
| Active sessions per pod | **20,000** (desktops + RDSH) |
| Pods per Cloud Pod Architecture (CPA) | 25 |
| Total desktops across full CPA | **50,000** |

**Practical VDI cluster**: 8–16 hosts with n+1 redundancy ≈ 2,250 VMs per cluster (Nutanix guidance).

Sources:
- [Omnissa Horizon 8 Architecture – TechZone](https://techzone.omnissa.com/resource/horizon-8-architecture)
- [Omnissa KB 2150348 – Horizon 7 sizing limits](https://kb.omnissa.com/s/article/2150348)

---

## PCIe GPU Slots per Server

The `pcieSlotsPerHost` slider is bounded by the realistic maximum for each GPU form factor:

| GPU form factor | Max cards (production) | PCIe slots consumed | Slider max |
|----------------|------------------------|---------------------|------------|
| Double-width (DW, slot_width = 2) | **4 cards** | 4 × 2 = **8 slots** | 8 |
| Single-width (SW, slot_width = 1) | **6 cards** | 6 × 1 = **6 slots** | 6 |

Representative servers:
- **4 DW**: Dell PowerEdge R750xa, HP ProLiant DL380 Gen10+
- **6–8 DW**: Lenovo ThinkSystem SR670 V2, Supermicro SYS-4029GP (specialized GPU chassis)

Higher counts exist in proprietary chassis (e.g., DGX using SXM, not PCIe) but are not representative of typical Horizon deployments.

---

## VM Target (Capacity Plan)

| Boundary | Value |
|----------|-------|
| Slider minimum | 10 VMs |
| Slider maximum | **20,000 VMs** (= one Horizon pod) |
| Slider step | 10 |

To plan for more than 20,000 VMs, use Cloud Pod Architecture and run the capacity plan per pod.
