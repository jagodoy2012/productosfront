import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { productos, productosSum } from '../interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ServicesService {
  url: string  ='http://127.0.0.1:8001/api/' // url base para las peticiones 
  constructor(private http: HttpClient) { }
  getProductos(){ /// get para los productos con sus sumas
    return this.http.get<productosSum[]>(`${this.url}productos`) 
  }
  getProductosSelect(){ // get completo de productos 
    return this.http.get<productos[]>(`${this.url}productosAl`) 
  }
  PostProductosSelect(body: productos){ /// agregar un nuevo producto
    return this.http.post<productos>(`${this.url}productosp`,body) 
  }
  PutProductos(body: productos,id: number){ ///// modificar un producto
    return this.http.put<productos[]>(`${this.url}productosput/${id}`,body) 
  }
  DelProductos(id: number){ // eliminar un producto 
    return this.http.delete<productos[]>(`${this.url}productosdel/${id}`) 
  }
}
