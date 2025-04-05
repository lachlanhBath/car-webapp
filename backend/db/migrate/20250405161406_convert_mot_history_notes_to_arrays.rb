class ConvertMotHistoryNotesToArrays < ActiveRecord::Migration[7.2]
  def up
    # Add temporary columns
    add_column :mot_histories, :advisory_notes_array, :string, array: true, default: []
    add_column :mot_histories, :failure_reasons_array, :string, array: true, default: []

    # Execute raw SQL to convert string data to arrays
    execute <<-SQL
      UPDATE mot_histories
      SET advisory_notes_array = string_to_array(advisory_notes, E'\\n')
      WHERE advisory_notes IS NOT NULL AND advisory_notes != '';
      
      UPDATE mot_histories
      SET failure_reasons_array = string_to_array(failure_reasons, E'\\n')
      WHERE failure_reasons IS NOT NULL AND failure_reasons != '';
    SQL

    # Remove old columns and rename new ones
    remove_column :mot_histories, :advisory_notes
    remove_column :mot_histories, :failure_reasons
    rename_column :mot_histories, :advisory_notes_array, :advisory_notes
    rename_column :mot_histories, :failure_reasons_array, :failure_reasons
  end

  def down
    # Add temporary columns
    add_column :mot_histories, :advisory_notes_text, :text
    add_column :mot_histories, :failure_reasons_text, :text

    # Convert arrays back to strings
    execute <<-SQL
      UPDATE mot_histories
      SET advisory_notes_text = array_to_string(advisory_notes, E'\\n')
      WHERE advisory_notes IS NOT NULL AND array_length(advisory_notes, 1) > 0;
      
      UPDATE mot_histories
      SET failure_reasons_text = array_to_string(failure_reasons, E'\\n')
      WHERE failure_reasons IS NOT NULL AND array_length(failure_reasons, 1) > 0;
    SQL

    # Remove array columns and rename text columns
    remove_column :mot_histories, :advisory_notes
    remove_column :mot_histories, :failure_reasons
    rename_column :mot_histories, :advisory_notes_text, :advisory_notes
    rename_column :mot_histories, :failure_reasons_text, :failure_reasons
  end
end
