import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/demo/api/product';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { ProductService } from 'src/app/demo/service/product.service';
import { DeviceService } from 'src/app/service/deviceservice';
import { ApiResponse } from 'src/app/model/api.response.model';
import { Device, DeviceType } from 'src/app/model/device.model';

@Component({
    templateUrl: './devices.component.html',
    providers: [MessageService]
})
export class DevicesComponent implements OnInit {

    deviceDialog: boolean = false;
    deleteProductDialog: boolean = false;
    deleteProductsDialog: boolean = false;
    products: Product[] = [];
    product: Product = {};
    selectedProducts: Product[] = [];
    submitted: boolean = false;
    cols: any[] = [];
    statuses: any[] = [];
    types: DeviceType[] = [];
    rowsPerPageOptions = [5, 10, 20];
    devices: Device[] = [];
    device: Device = {};

    constructor(
        private productService: ProductService,
        private messageService: MessageService,
        private deviceService: DeviceService
    ){ }

    ngOnInit() {

        this.deviceService.getDevicesByUser().subscribe((resp : Device[]) => {
            this.devices = resp;
            this.cols = [
                { field: 'devices', header: 'Devices' },
                { field: 'statuses', header: 'Status' }
            ];
            this.statuses = [
                { label: 'ACTIVE', value: 'active' },
                { label: 'OFFLINE', value: 'offline' }
            ];
        });

        this.deviceService.getDeviceTypes().subscribe((resp : DeviceType[]) => {
            this.types = resp;
            //this.types = {...this.types};
        });

        //this.productService.getProducts().then(data => this.products = data);
    }

    openNew() {
        this.device = {};
        this.submitted = false;
        this.deviceDialog = true;
    }

    deleteSelectedProducts() {
        //TODO this.deleteProductsDialog = true;
    }

    editDevice(device: Device) {

    }

    editProduct(product: Product) {
        this.product = { ...product };
        this.deviceDialog = true;
    }

    deleteProduct(product: Product) {
        this.deleteProductDialog = true;
        this.product = { ...product };
    }

    confirmDeleteSelected() {
        this.deleteProductsDialog = false;
        this.products = this.products.filter(val => !this.selectedProducts.includes(val));
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Products Deleted', life: 3000 });
        this.selectedProducts = [];
    }

    confirmDelete() {
        this.deleteProductDialog = false;
        this.products = this.products.filter(val => val.id !== this.product.id);
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Product Deleted', life: 3000 });
        this.product = {};
    }

    hideDialog() {
        this.deviceDialog = false;
        this.submitted = false;
    }

    saveDevice() {
        this.submitted = true;
        console.log('save device');
        console.dir(this.device);

        this.deviceService.addDevice(this.device).subscribe((resp : ApiResponse) => {
            console.dir(resp);
        });
    }

    saveProduct() {
        this.submitted = true;

        if (this.product.name?.trim()) {
            if (this.product.id) {
                // @ts-ignore
                this.product.inventoryStatus = this.product.inventoryStatus.value ? this.product.inventoryStatus.value : this.product.inventoryStatus;
                this.products[this.findIndexById(this.product.id)] = this.product;
                this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Product Updated', life: 3000 });
            } else {
                this.product.id = this.createId();
                this.product.code = this.createId();
                this.product.image = 'product-placeholder.svg';
                // @ts-ignore
                this.product.inventoryStatus = this.product.inventoryStatus ? this.product.inventoryStatus.value : 'INSTOCK';
                this.products.push(this.product);
                this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Product Created', life: 3000 });
            }

            this.products = [...this.products];
            this.deviceDialog = false;
            this.product = {};
        }
    }

    findIndexById(id: string): number {
        let index = -1;
        for (let i = 0; i < this.products.length; i++) {
            if (this.products[i].id === id) {
                index = i;
                break;
            }
        }

        return index;
    }

    createId(): string {
        let id = '';
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 5; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
}
