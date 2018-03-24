
let eq = [3, 5];


// let eq = [10, 20, 30];
let num_var =  eq.length;

/*
Todas as restricoes tem que ser <=
e restricoes de n negatividade >=
*/
// let restr = [ 
		
// 		{ left: [ 2, 2, 4], right: 300 },
// 		{ left: [ 0, 4, 3 ], right: 200 },
// 		{ left: [ 1 , 0 , 0], right: 20 },
// 		{ left: [ 4, 3, 0 ], right: 50 },
	
// 	];

let restr = [ 
		
		{ left: [ 1, 0], right: 4 },
		{ left: [ 0, 2 ], right: 12 },
		{ left: [ 3, 2], right: 18 }
	
	];

let num_var_folga = restr.length;

// linhas = header + numero de folgas + z (1)
const num_rows = num_var_folga + 2;

// colunas = 1 + variaveis + folgas + LD + 1
const num_cols = num_var + num_var_folga + 2

/*
Step 1: Passa todos os X para o lado do Z
*/
function transform_z(eq) 
{
	return eq.map( el => el * -1)
}

function get_z_line()
{
	// find coluna do Z
	let z_line = "";

	for(let i=0; i < table.length; i++) 
	{			
		if(table[i][0] == "Z") 
		{ 
			z_line = i; 
			break;
		}
	}
	return z_line;
}
function get_col_pivo(table)
{	
	const z_line = get_z_line(table);

	// find lowers number in this column
	let min_number = Number.MAX_SAFE_INTEGER;
	let min_index = "";

	for(let i=0; i < table[z_line].length; i++) 
	{			
		if(table[z_line][i] < min_number) 
		{ 
			min_number = table[z_line][i];
			min_index = i;
		}
	}

	//console.log("min num: ", min_number);
	return min_index;
}

function get_linha_pivo(table, col_pivo)
{
	let calculations = [];

	// calculates LD / CP for each number in the CP
	for(let i=2; i < table.length; i++) 
	{	
		const ld = table[i][num_cols - 1];
		const val_cp = table[i][col_pivo];
		
		result = ld / val_cp;

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

function get_number_pivo(table, linha_pivo, col_pivo)
{
	return table[linha_pivo][col_pivo];
}

/*
	Constroi a nova linha pivo
*/
function build_new_row(table, linha_pivo, col_pivo)
{
	const number_pivo = get_number_pivo(table, linha_pivo, col_pivo);
	const _linha_pivo = table[linha_pivo];

	const col_pivo_header = table[0][col_pivo];

	const new_line = [ col_pivo_header ];

	for(let i=1; i < _linha_pivo.length;i++)
	{
		const current_num = _linha_pivo[i];

		new_line.push( current_num / number_pivo );
	}

	table[linha_pivo] = new_line;
}

/*
atualiza toda a tabela, baseando-se na atual linha antiga, Coef. Pivo da linha e na nova linha pivo.
*/
function update_table(table, linha_pivo, col_pivo)
{
	for(let i=1; i < table.length; i++)
	{	
		// dont do this for the linha pivo
		if( i == linha_pivo ) { continue; }

		// coeficiente pivo atual da linha
		const coef_P = table[i][col_pivo];

		for(let j=1; j < table[i].length; j++)
		{ 
			const current_num = table[i][j];

			const pivo_line_num = table[linha_pivo][j];

			const new_num =  current_num + (- coef_P)  * pivo_line_num;

			table[i][j] = new_num;
		}
	}
}

function has_finished(table)
{
	const z_line = get_z_line(table);

	let has_negative = false;

		console.log("z_line", table[z_line]);
	try 
	{
		table[z_line].forEach(e => {

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
		//console.log(e);
	}

	return !has_negative;
}	

function build_table()
{
	let table = [];

	for(let i=0; i < num_rows; i++) 
	{	
		table[i] = [];
		for(let j=0; j < num_cols; j++)
		{
			table[i][j] = 0;
		} 
	}

	eq2 = transform_z(eq)

	/****************First row******************/
	let first_row = table[0];
	first_row[0] = ""
	//add headers to first row

	for(let i=1; i <= num_var;i++)
	{
		first_row[i] = "X"+i; 
	}

	for(let i=num_var+1; i <= num_var_folga + num_var;i++)
	{
		first_row[i] = "F" + (i - num_var); 
	}

	first_row[num_cols-1] = "LD";

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
	for (let i =0; i < restr.length; i++) 
	{
		const rest = restr[i];
			
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
		table[row][num_cols-1] = rest.right;

		//console.log(table)
		row+=1;
	}

	/**************** end Folga rows******************/


	return table;
}





















