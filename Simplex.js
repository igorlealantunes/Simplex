class Simplex {

	constructor(instance)
	{
		this.instance = instance;

		this.eq = instance.eq;
		this.restr = instance.restr;

		this.num_var = this.eq.length;
		this.num_var_folga = this.restr.length;

		this.num_rows = this.num_var_folga + 2;
		this.num_cols = this.num_var + this.num_var_folga + 2;

		this.table = this.build_table();
	}

	transform_z()
	{
		return this.eq.map( el => el * -1)
	}

	get_z_line()
	{
		// find coluna do Z
		let z_line = "";

		for(let i=0; i < this.table.length; i++) 
		{			
			if(this.table[i][0] == "Z") 
			{ 
				z_line = i; 
				break;
			}
		}

		return z_line;
	}

	get_col_pivo()
	{
		const z_line = this.get_z_line();

		// find lowers number in this column
		let min_number = Number.MAX_SAFE_INTEGER;
		let min_index = "";

		for(let i=0; i < this.table[z_line].length; i++) 
		{			
			if(this.table[z_line][i] < min_number) 
			{ 
				min_number = this.table[z_line][i];
				min_index = i;
			}
		}

		//console.log("min num: ", min_number);
		return min_index;
	}

	get_linha_pivo(col_pivo)
	{
		let calculations = [];

		// calculates LD / CP for each number in the CP
		for(let i=2; i < this.table.length; i++) 
		{	
			const ld = this.table[i][this.num_cols - 1];
			const val_cp = this.table[i][col_pivo];
			
			let result = ld / val_cp;

			calculations.push({ row : i, val : result});
		}

		// gets the lowest result
		let min = Number.MAX_SAFE_INTEGER;
		let min_index = "";

		//console.log("calculations", calculations);
		
		calculations.forEach( e => {

			if(e.val < min)
			{
				min = e.val;
				min_index = e.row;
			}
		});

		return min_index;
	}

	get_number_pivo(linha_pivo, col_pivo)
	{
		return this.table[linha_pivo][col_pivo];
	}

	build_new_row(linha_pivo, col_pivo)
	{
		const number_pivo = this.get_number_pivo(linha_pivo, col_pivo);
		const _linha_pivo = this.table[linha_pivo];

		const col_pivo_header = this.table[0][col_pivo];

		const new_line = [ col_pivo_header ];

		for(let i=1; i < _linha_pivo.length;i++)
		{
			const current_num = _linha_pivo[i];

			new_line.push( current_num / number_pivo );
		}

		this.table[linha_pivo] = new_line;
	}

	update_table(linha_pivo, col_pivo)
	{
		for(let i=1; i < this.table.length; i++)
		{	
			// dont do this for the linha pivo
			if( i == linha_pivo ) { continue; }

			// coeficiente pivo atual da linha
			const coef_P = this.table[i][col_pivo];

			for(let j=1; j < this.table[i].length; j++)
			{ 
				const current_num = this.table[i][j];

				const pivo_line_num = this.table[linha_pivo][j];

				const new_num =  current_num + (- coef_P)  * pivo_line_num;

				this.table[i][j] = new_num;
			}
		}
	}

	has_finished()
	{
		const z_line = this.get_z_line();

		let has_negative = false;

		console.log("z_line", this.table[z_line]);
		
		try 
		{
			this.table[z_line].forEach(e => {

				console.log("e", e)
				if( e < -0.000001) // offset
				{
					has_negative = true;
					throw "Has Negative"; 
				}

			});
		} 
		catch(e)
		{
			console.log(e);
		}

		return !has_negative;
	}	

	build_table()
	{
		let table = [];

		for(let i=0; i < this.num_rows; i++) 
		{	
			table[i] = [];
			for(let j=0; j < this.num_cols; j++)
			{
				table[i][j] = 0;
			} 
		}

		let eq2 = this.transform_z(this.eq)

		/****************First row******************/
		let first_row = table[0];
		first_row[0] = ""
		//add headers to first row

		for(let i=1; i <= this.num_var;i++)
		{
			first_row[i] = "X"+i; 
		}

		for(let i=this.num_var+1; i <= this.num_var_folga + this.num_var;i++)
		{
			first_row[i] = "F" + (i - this.num_var); 
		}

		first_row[this.num_cols-1] = "LD";

		table[0] = first_row;

		/**************** end First row******************/

		/****************Seccond row******************/
		let seccond_row = table[1];
		seccond_row[0] = "Z"
		
		for(let i=1; i <= eq2.length ;i++)
		{
			seccond_row[i] = eq2[i-1]; 
		}	


		table[1] = seccond_row;
		/**************** end seccond row******************/

		/****************Folga rows******************/
		
		let row = 2; // initial row for var de folga
		for (let i =0; i < this.restr.length; i++) 
		{
			const rest = this.restr[i];
				
			const f_num = "F"+(i+1);
			table[row][0] = f_num;

			//console.log("f_num, ", f_num)
			//console.log("rest", rest)
			
			for(var j=0; j < rest.left.length; j++)
			{
				// add Lado Esquerdo
				table[row][j+1] = rest.left[j]	
			}

			// add F index 1 (matrix identidade)
			const position_i = (j+1) + (row - 2);
			table[row][position_i] = 1;

			// add Lado Direito
			table[row][this.num_cols-1] = rest.right;

			//console.log(table)
			row+=1;
		}

		/**************** end Folga rows******************/

		return table;
	}

	run()
	{
		console.log("Original Table, ", this.table)

		let iteration = 1;
		while(true)
		{	
			console.log("Iteration :" + iteration++);

			// checks is Z has negative numbers
			if(this.has_finished())
			{	
				console.log("FINISHED!!!");
				break;
			}

			let col_pivo = this.get_col_pivo();

			let linha_pivo = this.get_linha_pivo(col_pivo);

			let number_pivo = this.get_number_pivo(linha_pivo, col_pivo);

			console.log("col_pivo", col_pivo)
			console.log("linha_pivo", linha_pivo)
			console.log("number_pivo", number_pivo)

			this.build_new_row(linha_pivo, col_pivo);
			this.update_table(linha_pivo, col_pivo)

			console.log("Table, ", this.table)
			
		}

	}

}