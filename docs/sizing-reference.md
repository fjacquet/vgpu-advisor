# Sizing Reference — vGPU Advisor

Infrastructure limits used as slider boundaries, sourced from official vendor documentation (early 2026).

---

## Platform × Product Support Matrix

| | **ESXi / vSphere** | **Nutanix AHV** | **OpenShift Virtualization** |
|---|---|---|---|
| **Omnissa Horizon** | ✅ GA — full vGPU | ✅ GA (Horizon 2512) — vGPU GA | ✅ Manual pools GA; Instant Clone 🔄; vGPU ✅ |
| **Citrix VAD / DaaS** | ✅ GA — full vGPU | ✅ GA — vGPU GA | ✅ GA (VAD 2511+) — GPU/SR-IOV 🔄 testing |
| **Microsoft AVD / RDS** | ✅ (on-prem RDS) | Partial (RDS only) | ❌ Not supported |

🔄 = in development / testing

---

## Hypervisor Cluster Limits

### ESXi / vSphere

| Version | Max hosts/cluster | Max VMs/host | Max hosts/vCenter |
|---------|------------------|--------------|-------------------|
| vSphere 7 | **64** | 1,024 | 2,500 |
| vSphere 8 | **64** | 1,024 | 2,500 |
| vSphere 9 | **128** | — | 2,500 |

**VDI best practice**: 8–16 hosts per cluster (n+1 HA).

Sources: [Broadcom configmax](https://configmax.broadcom.com/guest?vmwareproduct=vSphere&release=vSphere+8.0) · [virten.net](https://www.virten.net/vmware/vmware-vsphere-esx-and-vcenter-configuration-maximums/)

### Nutanix AHV

| Boundary | Limit |
|----------|-------|
| Max nodes per AHV cluster | **32** |
| Recommended VDI cluster | **16 nodes** (n+1 = 15 usable) |
| VMs per node (VDI typical) | ~150 |
| VMs per Prism Central instance | **5,000** |
| Practical VMs per cluster | ~2,250 (15 × 150) |

Sources: [Omnissa on Nutanix AHV design guide](https://community.omnissa.com/technical-blog/omnissa-horizon-8-on-nutanix-ahv-design-guidance-r171/) · [Nutanix Citrix best practices](https://portal.nutanix.com/page/documents/solutions/details?targetId=BP-2079-Citrix-Virtual-Apps-and-Desktops:BP-2079-Citrix-Virtual-Apps-and-Desktops)

### OpenShift Virtualization (OCP)

| Boundary | Limit |
|----------|-------|
| Max worker nodes per OCP cluster | 500 (Red Hat recommends RHACM above 100) |
| Practical VDI cluster | **16–64 bare metal nodes** |
| GPU node constraint | Bare metal only; single mode per node (vGPU or passthrough or containers — not mixed) |
| MIG-backed vGPU | ✅ Supported (Ampere+) |

Sources: [NVIDIA GPU Operator + OCP Virt](https://docs.nvidia.com/datacenter/cloud-native/openshift/latest/openshift-virtualization.html) · [OCP vGPU config](https://docs.openshift.com/container-platform/4.14/virt/virtual_machines/advanced_vm_management/virt-configuring-virtual-gpus.html)

---

## Omnissa Horizon Sizing

### Pod limits (all hypervisors)

| Boundary | Limit |
|----------|-------|
| Connection Servers per pod | 7 |
| Active sessions per pod | **20,000** (desktops + RDSH) |
| Pods per Cloud Pod Architecture (CPA) | 25 |
| Total desktops across CPA | **50,000** |

### Per hypervisor

| Platform | Recommended cluster | vGPU status |
|----------|--------------------|-|
| vSphere 7/8 | 8–16 hosts | ✅ Full (Q/B/A/C profiles) |
| vSphere 9 | up to 32 hosts | ✅ Full |
| Nutanix AHV | 16 nodes (≤32 max) | ✅ GA since Horizon 2512 |
| OpenShift Virt | 16–64 bare metal nodes | ✅ vGPU; Instant Clone 🔄 |

Sources: [Omnissa TechZone architecture](https://techzone.omnissa.com/resource/horizon-8-architecture) · [KB 2150348](https://kb.omnissa.com/s/article/2150348) · [Red Hat × Omnissa blog](https://www.redhat.com/en/blog/red-hat-collaborating-omnissa-bring-horizon-virtual-desktops-openshift-virtualization)

---

## Citrix Virtual Apps and Desktops / DaaS Sizing

### Site / zone limits

| Boundary | Limit |
|----------|-------|
| VDAs per resource location (zone) | **10,000** (hard limit) |
| Linked clones per cluster (vSphere) | **4,000** |
| Sessions per zone | **25,000** |
| Total VDAs per DaaS instance | 130,000 |
| Total concurrent users | 125,000+ (multi-instance) |
| Delivery Groups | 2,000 |
| Machine Catalogs | 2,000 |

### Per hypervisor

| Platform | Status | vGPU status |
|----------|--------|-------------|
| vSphere 6.0+ | ✅ GA | ✅ Full NVIDIA vGPU (Q/B/A/C) |
| Nutanix AHV | ✅ GA (MCS via Prism Central) | ✅ NVIDIA vApps, vPC, vWS |
| OpenShift Virt (VAD 2511+) | ✅ GA | 🔄 SR-IOV testing; not yet GA |

**Note**: Profile IDs are identical to Horizon (e.g. `nvidia_l40s-4q`). The Config Snippet tab generates `xe` CLI commands for XenServer alongside Horizon configuration.

Sources: [Citrix DaaS limits](https://docs.citrix.com/en-us/citrix-daas/limits.html) · [Citrix on OCP](https://docs.citrix.com/en-us/citrix-virtual-apps-desktops/install-configure/install-prepare/red-hat-open-shift.html) · [Citrix on Nutanix](https://docs.citrix.com/en-us/citrix-virtual-apps-desktops/install-configure/install-prepare/nutanix.html)

---

## Microsoft AVD / Windows 365 / RDS

Microsoft's EUC offering is **not lagging for cloud deployments**, but has no on-premises hypervisor story:

| Product | Model | GPU support | On-prem |
|---------|-------|-------------|---------|
| Azure Virtual Desktop (AVD) | Azure-hosted, multi-session | ✅ NVadsA10v5, NVv4 (AMD), NCasT4 | ❌ |
| Windows 365 | Fixed Cloud PC (1:1) | ✅ 3 GPU tiers | ❌ |
| RDS (Remote Desktop Services) | On-prem, legacy | ✅ Functional, not actively developed | ✅ |

**Verdict**: AVD is production-mature for cloud-hosted GPU VDI. RDS is the lagging part — it receives no new features and Microsoft's strategic direction is AVD/W365. On-premises enterprise VDI with NVIDIA vGPU remains the domain of Omnissa and Citrix.

Sources: [AVD GPU acceleration](https://learn.microsoft.com/en-us/azure/virtual-desktop/graphics-enable-gpu-acceleration) · [Windows 365 vs AVD](https://www.techtarget.com/searchvirtualdesktop/tip/Comparing-Windows-365-vs-Azure-Virtual-Desktop)

---

## PCIe GPU Slots per Server

| GPU form factor | Max cards (production) | PCIe slots consumed | `pcieSlotsPerHost` max |
|----------------|------------------------|---------------------|------------------------|
| Double-width (DW, slot_width = 2) | **4 cards** | 4 × 2 = **8 slots** | 8 |
| Single-width (SW, slot_width = 1) | **6 cards** | 6 × 1 = **6 slots** | 6 |

Representative servers: Dell PowerEdge R750xa / HP DL380 Gen10+ (4 DW) · Lenovo SR670 V2 / Supermicro SYS-4029GP (6–8 DW).

---

## VM Target (Capacity Plan)

| Boundary | Value |
|----------|-------|
| Slider minimum | 10 VMs |
| Slider maximum | **20,000 VMs** (= one Horizon/Citrix zone) |
| Slider step | 10 |

For deployments beyond 20,000 VMs: use CPA (Horizon) or multi-zone (Citrix) and run the capacity plan per pod/zone.
