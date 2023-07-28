import { Component, Inject, Optional, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { AppAddEmployeeComponent } from './add/add.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServicesService } from './services/services.service';
import { productos, productosSum } from './interfaces/interfaces';
import { Data, Event } from '@angular/router';
import Swal from 'sweetalert2';





@Component({
  templateUrl: './employee.component.html',
})
export class AppEmployeeComponent implements AfterViewInit {
  @ViewChild(MatTable, { static: true }) table: MatTable<any> = Object.create(null);
  searchText: any;
  // para mostrar las columnas que lllevara 
  displayedColumns: string[] = [
    '#',
    'DESCRIPCION',
    'STOCK',
    'action'
  ];

/// se declaran variables con interfases igual la data de la tabla 
  dataSource: MatTableDataSource<productosSum>;
  productos!: productosSum[];
  producto!: productos;
  prodselect: productos[] = [];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = Object.create(null);

  constructor(public dialog: MatDialog, public datePipe: DatePipe, private services: ServicesService) { 

    this.dataSource = new MatTableDataSource(this.productos);
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    /// llamdo a la funcion para llenar la tabla de productos 
      this.services.getProductos()
      .subscribe(resp=>
        {

          /// al finalizar la consulta actualiza la tabla 
          this.productos = resp;
          this.dataSource = new MatTableDataSource(this.productos)
          this.dataSource.paginator = this.paginator;
        })

      
      
     
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openDialog(action: string, titulo: string, obj: any): void {
    obj.action = action;
    obj.titulo = titulo;
  
    const dialogRef = this.dialog.open(AppEmployeeDialogContentComponent, {
      data: obj,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      
      //// al finalizar el dialogo emergente se verifica que accion se tomara 
      if (result.event === 'Guardar') {

        /// se crea el nuevo producto con la informacion del modal
        var product: productos = {
          referencia: result.data.referencia,
          descrip: result.data.producto,
          stock: result.data.stock,
          REF: result.data.referencia
        }

        // se llama la funcion para  hacer el insert 
        this.services.PostProductosSelect(product)
        .subscribe(resp =>{


          resp.REF = resp.REF+'.'+resp.id       
          
          /// para poder realizar el ciclo infinito de padres e hijos se hace una actualizaion para agregar el orden correcto y poder volver hacer el proceso
          this.services.PutProductos(resp,resp.id!)
          .subscribe(resp1 =>{
///     alerta para notificar que se realizo el actualizar
            Swal.fire({
              position: 'top-end',
              icon: 'success',
              iconColor: 'green',
              color: 'green',
              title: 'Producto Cargado ',
              showConfirmButton: false,
              timer: 2000
            })
            this.services.getProductos()
            .subscribe(resp=>
              {
                this.productos = resp;
                this.dataSource = new MatTableDataSource(this.productos)
                this.dataSource.paginator = this.paginator;
              })

          })



        })
       
      } else if (result.event === 'Modificar') {
    
        var product: productos = {
          referencia: result.data.referencia,
          descrip: result.data.producto,
          stock: result.data.stock,
          REF: result.data.referencia+'.'+result.data.id
        }

        this.services.PutProductos(product,result.data.id!)
          .subscribe(resp1 =>{

            Swal.fire({
              position: 'top-end',
              icon: 'success',
              iconColor: 'green',
              color: 'green',
              title: 'Producto Actualizado ',
              showConfirmButton: false,
              timer: 2000
            })
            this.services.getProductos()
            .subscribe(resp=>
              {
                this.productos = resp;
                this.dataSource = new MatTableDataSource(this.productos)
                this.dataSource.paginator = this.paginator;
              })

          })
      
      } else if (result.event === 'Eliminar') {
       // this.deleteRowData(result.data);
       this.services.DelProductos(result.data.id!)
       .subscribe(resp1 =>{

         Swal.fire({
           position: 'top-end',
           icon: 'success',
           iconColor: 'green',
           color: 'green',
           title: 'Producto Eliminado ',
           showConfirmButton: false,
           timer: 2000
         })
         this.services.getProductos()
         .subscribe(resp=>
           {
             this.productos = resp;
             this.dataSource = new MatTableDataSource(this.productos)
             this.dataSource.paginator = this.paginator;
           })

       })
      }
    });
  }

  // tslint:disable-next-line - Disables all
 

  

 
}
interface Food {
  value: string;
  viewValue: string;
}
@Component({
  // tslint:disable-next-line: component-selector
  selector: 'app-dialog-content',
  templateUrl: 'employee-dialog-content.html',
})
// tslint:disable-next-line: component-class-suffix
export class AppEmployeeDialogContentComponent {
  
  action: string;
  titulo: string;
  id: string;
  // tslint:disable-next-line - Disables all
  local_data: any;
  selectedImage: any = '';
  joiningDate: any = '';
  prodselect: productos[] = [];
  
  public form: FormGroup = Object.create(null);
  constructor(
    private fb: FormBuilder,
    public datePipe: DatePipe,
    public dialogRef: MatDialogRef<AppEmployeeDialogContentComponent>,
    private services: ServicesService,
    // @Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: productos,
    
    
  ) {
    
    this.services.getProductosSelect()
    .subscribe(resp=>{
      this.prodselect = resp;
    })
    this.local_data = { ...data };
    
    this.action = this.local_data.action;
    this.titulo = this.local_data.titulo;
    this.id = this.local_data.id;
  

    this.form = this.fb.group({
     
      referencias:[
        null,
        Validators.compose([
          Validators.required,
         
        ]),
      ],
    });
    if (this.local_data.DateOfJoining !== undefined) {
      this.joiningDate = this.datePipe.transform(
        new Date(this.local_data.DateOfJoining),
        'yyyy-MM-dd',
      );
    }
    if (this.local_data.imagePath === undefined) {
      this.local_data.imagePath = 'assets/images/profile/user-1.jpg';
    }
  }

  doAction(): void {
    this.dialogRef.close({ event: this.action, data: this.local_data });
  }
  closeDialog(): void {
    this.dialogRef.close({ event: 'Cancel' });
  }

  selectFile(event: any): void {
    if (!event.target.files[0] || event.target.files[0].length === 0) {
      // this.msg = 'You must select an image';
      return;
    }
    const mimeType = event.target.files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      // this.msg = "Only images are supported";
      return;
    }
    // tslint:disable-next-line - Disables all
    const reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]);
    // tslint:disable-next-line - Disables all
    reader.onload = (_event) => {
      // tslint:disable-next-line - Disables all
      this.local_data.imagePath = reader.result;
    };
  }
}
