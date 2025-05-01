import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-part-dealer-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './part-dealer-dashboard.component.html',
  styleUrls: ['./part-dealer-dashboard.component.scss']
})
export class PartDealerDashboardComponent {
  inventory = [
    { id: 301, name: 'Oil Filter', category: 'Filters', price: 12.99, stock: 45 },
    { id: 302, name: 'Brake Pads', category: 'Brakes', price: 29.99, stock: 28 },
    { id: 303, name: 'Spark Plugs (4pk)', category: 'Ignition', price: 15.49, stock: 37 },
    { id: 304, name: 'Air Filter', category: 'Filters', price: 9.99, stock: 52 }
  ];
  
  lowStockThreshold = 30;
}