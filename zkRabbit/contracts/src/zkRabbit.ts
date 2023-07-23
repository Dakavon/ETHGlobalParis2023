import { Field, Bool, SmartContract, state, State, method, Circuit, Poseidon } from 'snarkyjs';

/**
 * zkRabbit - A zkApp for Mina
 * A hackathon project during ETHGlobal Paris 2023
 * 
 * A simple one-dimensional map with just five fields (which still needs to be inforced)
 * 
 * See https://docs.minaprotocol.com/zkapps for more info.
 */
export class zkRabbit extends SmartContract {
  @state(Field) zkfield = State<Field>();
  @state(Bool) gameEnded = State<Bool>();

  @method initState(salt: Field) {
    super.init();
    this.zkfield.set(Poseidon.hash([salt, Field(0)]));  //Initialise field to 0
    this.gameEnded.set(Bool(false));
  }

  @method zkmove(salt: Field, oldField: Field, newField: Field) {
    const currentField = this.zkfield.getAndAssertEquals();

    //Check if the user knows the current field and salt
    currentField.assertEquals(Poseidon.hash([salt, oldField]));

    //Restrict staying on the same field
    currentField.assertNotEquals(Poseidon.hash([salt, newField]));

    //Hide new field
    const newZkField = Poseidon.hash([salt, newField]);
    
    //Lets wrap our head again around how to check staying on the map
    //We have to check if the new field is one of the five fields :)

    //Save this round
    this.zkfield.set(newZkField);
    this.gameEnded.set(Circuit.if(newField.equals(Field(4)), Bool(true), Bool(false)));
  }
}